const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { Client } = require('pg');
const fs = require('fs');
const crypto = require('crypto');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Areej123%21%40%23%24%25%5E%26%2A%28%29@db.wvxwidqpqaqnepoktdnn.supabase.co:5432/postgres';

const DATA_TABLE_ORDER = ['users', 'books', 'orders', 'notifications', 'transactions', 'order_items', 'user_viewed_books'];
const PARENT_REFERENCE_RULES = [
  { parentTable: 'users', childTable: 'books', columnName: 'ownerId' },
  { parentTable: 'users', childTable: 'orders', columnName: 'buyerId' },
  { parentTable: 'users', childTable: 'orders', columnName: 'sellerId' },
  { parentTable: 'users', childTable: 'notifications', columnName: 'userId' },
  { parentTable: 'users', childTable: 'transactions', columnName: 'requester' },
  { parentTable: 'users', childTable: 'transactions', columnName: 'owner' },
  { parentTable: 'users', childTable: 'user_viewed_books', columnName: 'userId' },
  { parentTable: 'books', childTable: 'transactions', columnName: 'book' },
  { parentTable: 'books', childTable: 'order_items', columnName: 'bookId' },
  { parentTable: 'books', childTable: 'user_viewed_books', columnName: 'bookId' },
  { parentTable: 'orders', childTable: 'order_items', columnName: 'orderId' },
  { parentTable: 'orders', childTable: 'notifications', columnName: 'orderId' }
];

const splitSqlStatements = (sql) => {
  const statements = [];
  let current = '';
  let inSingleQuote = false;
  let i = 0;

  const normalizedSql = sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\n{3,}/g, '\n\n');

  while (i < normalizedSql.length) {
    const char = normalizedSql[i];
    const next = normalizedSql[i + 1];

    if (char === "'") {
      if (inSingleQuote && next === "'") {
        current += "''";
        i += 2;
        continue;
      }
      inSingleQuote = !inSingleQuote;
      current += char;
      i += 1;
      continue;
    }

    if (!inSingleQuote && char === ';') {
      const trimmed = current.trim();
      if (trimmed) {
        statements.push(trimmed);
      }
      current = '';
      i += 1;
      continue;
    }

    current += char;
    i += 1;
  }

  const lastStatement = current.trim();
  if (lastStatement) {
    statements.push(lastStatement);
  }

  return statements.filter((statement) => /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|COPY|SET|BEGIN|COMMIT|ANALYZE|VACUUM)\b/i.test(statement));
};

const getTableName = (statement) => {
  const insertMatch = statement.match(/INSERT\s+INTO\s+(?:ONLY\s+)?public\.(\w+)/i);
  if (insertMatch) return insertMatch[1].toLowerCase();

  const copyMatch = statement.match(/COPY\s+(?:public\.)?(\w+)/i);
  if (copyMatch) return copyMatch[1].toLowerCase();

  return null;
};

const parseInsertValues = (statement) => {
  const valuesMatch = statement.match(/VALUES\s*\((.*)\)\s*;?$/is);
  if (!valuesMatch) return [];

  const raw = valuesMatch[1];
  const values = [];
  let current = '';
  let depth = 0;
  let inSingleQuote = false;

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];
    const next = raw[i + 1];

    if (char === "'") {
      if (inSingleQuote && next === "'") {
        current += "''";
        i += 1;
      } else {
        inSingleQuote = !inSingleQuote;
        current += char;
      }
      continue;
    }

    if (!inSingleQuote) {
      if (char === '(' || char === '[' || char === '{') {
        depth += 1;
      } else if (char === ')' || char === ']' || char === '}') {
        depth = Math.max(0, depth - 1);
      } else if (char === ',' && depth === 0) {
        values.push(current.trim());
        current = '';
        continue;
      }
    }

    current += char;
  }

  if (current.trim()) {
    values.push(current.trim());
  }

  return values;
};

const normalizeSqlValue = (value) => {
  const trimmed = (value || '').trim();
  if (!trimmed || trimmed === 'NULL') return null;
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }
  return trimmed;
};

const normalizeId = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const normalized = String(value).trim();
  if (/^-?\d+$/.test(normalized)) return Number(normalized);
  return normalized;
};

const getValueByColumnName = (values, tableName, columnName) => {
  const columnIndex = {
    users: { id: 0 },
    books: { id: 0, ownerId: 18 },
    orders: { id: 0, buyerId: 1, sellerId: 2 },
    notifications: { id: 0, userId: 1, orderId: 4 },
    transactions: { id: 0, book: 1, requester: 2, owner: 3 },
    order_items: { id: 0, orderId: 1, bookId: 2 },
    user_viewed_books: { id: 0, userId: 1, bookId: 2 }
  };

  if (!columnIndex[tableName] || typeof columnIndex[tableName][columnName] === 'undefined') {
    return null;
  }

  const value = values[columnIndex[tableName][columnName]];
  return normalizeSqlValue(value);
};

const isDataStatement = (statement) => {
  const tableName = getTableName(statement);
  return Boolean(tableName) && /^(insert|copy)\s+/i.test(statement);
};

const orderDataStatements = (statements) => {
  const grouped = {};

  statements.forEach((statement) => {
    const tableName = getTableName(statement);
    const priority = tableName ? DATA_TABLE_ORDER.indexOf(tableName) : DATA_TABLE_ORDER.length;
    const safePriority = priority === -1 ? DATA_TABLE_ORDER.length : priority;

    if (!grouped[safePriority]) {
      grouped[safePriority] = [];
    }

    grouped[safePriority].push(statement);
  });

  return Object.keys(grouped)
    .sort((a, b) => Number(a) - Number(b))
    .flatMap((key) => grouped[key]);
};

const sanitizeDataStatements = (statements) => {
  const crypto = require('crypto');
  const idMap = new Map();
  const sanitizeValue = (val) => {
    if (val === null || val === undefined) return val;
    const v = String(val).trim();
    if (v.length > 24) {
      if (!idMap.has(v)) {
        idMap.set(v, crypto.randomBytes(12).toString('hex'));
      }
      return idMap.get(v);
    }
    return v;
  };

  return statements.map((statement) => {
    const tableName = getTableName(statement);
    if (!tableName) return statement;

    const values = parseInsertValues(statement);
    if (!values || values.length === 0) return statement;

    let modified = statement;
    // Only consider columns that are likely to be id references from our columnIndex
    const columns = Object.keys({
      users: { id: 0 },
      books: { id: 0, ownerId: 18 },
      orders: { id: 0, buyerId: 1, sellerId: 2 },
      notifications: { id: 0, userId: 1, orderId: 4 },
      transactions: { id: 0, book: 1, requester: 2, owner: 3 },
      order_items: { id: 0, orderId: 1, bookId: 2 },
      user_viewed_books: { id: 0, userId: 1, bookId: 2 }
    }[tableName] || {});

    Object.keys(columns).forEach((col) => {
      const idx = columns[col];
      const raw = values[idx];
      if (!raw) return;
      const normalized = raw.trim();
      // Only sanitize quoted string literals
      const m = normalized.match(/^'(.*)'$/s);
      if (!m) return;
      const inner = m[1].replace(/''/g, "'");
      if (inner.length > 24) {
        const newId = sanitizeValue(inner);
        const oldLiteral = normalized.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
        const newLiteral = `'${String(newId).replace(/'/g, "''")}'`;
        modified = modified.replace(new RegExp(oldLiteral, 'g'), newLiteral);
      }
    });

    return modified;
  });
};

// Precise sanitizer using table column order and limits
const TABLE_COLUMN_ORDER = {
  books: ['id','title','author','description','condition','category','exchangeType','price','rentWeek','rentMonth','securityDeposit','images','image','pdf','subject','duration','status','views','ownerId','createdAt','updatedAt'],
  notifications: ['id','userId','message','type','actionLink','orderId','isRead','createdAt','updatedAt'],
  order_items: ['id','orderId','bookId','title','type','price','quantity'],
  orders: ['id','buyerId','sellerId','bookAmount','deliveryFee','totalAmount','shippingAddress','shippingPhone','shippingName','trackingData','paymentData','status','complainReason','createdAt','updatedAt'],
  transactions: ['id','book','requester','owner','exchangeType','status','message','createdAt','updatedAt'],
  user_viewed_books: ['id','userId','bookId','category','views','createdAt','updatedAt']
};

const COLUMN_LIMITS = {
  id:24, title:255, author:255, condition:20, category:30, exchangeType:20, ownerId:24,
  userId:24, actionLink:255, orderId:24, bookId:24, buyerId:24, sellerId:24, shippingPhone:50, shippingName:100, status:30, book:24, requester:24, owner:24, type:20, image:255
};

const parseValuesFromStatement = (statement) => {
  const m = statement.match(/VALUES\s*(\([\s\S]*\))\s*;?$/i);
  if (!m) return [];
  const raw = m[1];
  const values = [];
  let current = '';
  let inSingleQuote = false;
  let depth = 0;

  for (let i = 1; i < raw.length - 1; i += 1) {
    const char = raw[i];
    const next = raw[i + 1];
    if (char === "'") {
      current += char;
      if (inSingleQuote && next === "'") {
        current += "'"; // escaped quote
        i += 1;
        continue;
      }
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (!inSingleQuote) {
      if (char === '(') {
        depth += 1;
      } else if (char === ')') {
        depth = Math.max(0, depth - 1);
      } else if (char === ',' && depth === 0) {
        values.push(current.trim());
        current = '';
        continue;
      }
    }

    current += char;
  }

  if (current.trim()) values.push(current.trim());
  return values;
};

const sanitizeDataStatementsPrecise = (statements) => {
  const longIdMap = new Map();
  const mapLongId = (s) => {
    if (s.length <= 24) return s;
    if (!longIdMap.has(s)) longIdMap.set(s, crypto.randomBytes(12).toString('hex'));
    return longIdMap.get(s);
  };

  return statements.map((statement) => {
    const table = getTableName(statement);
    if (!table || !TABLE_COLUMN_ORDER[table]) return statement;
    const colOrder = TABLE_COLUMN_ORDER[table];
    const values = parseValuesFromStatement(statement);
    if (!values || values.length === 0) return statement;

    const newValues = values.map((val, idx) => {
      const col = colOrder[idx];
      if (!col) return val;
      const limit = COLUMN_LIMITS[col];
      // handle NULL and non-quoted values
      if (!/^'.*'$/s.test(val)) return val;
      const inner = val.slice(1, -1).replace(/''/g, "'");
      if (limit && inner.length > limit) {
        if (col === 'id' || /Id$/.test(col) || col === 'buyerId' || col === 'sellerId' || col === 'ownerId' || col === 'userId' || col === 'bookId' || col === 'orderId') {
          const mapped = mapLongId(inner);
          return `'${String(mapped).replace(/'/g, "''")}'`;
        }
        // truncate safely
        const truncated = inner.slice(0, limit);
        return `'${String(truncated).replace(/'/g, "''")}'`;
      }
      return val;
    });

    // rebuild statement by replacing the VALUES (...) segment
    const rebuilt = statement.replace(/VALUES\s*\([\s\S]*\)\s*;?$/i, () => {
      return 'VALUES (' + newValues.join(', ') + ')';
    });

    return rebuilt;
  });
};

const executeStatements = async (client, statements, label) => {
  for (let i = 0; i < statements.length; i += 1) {
    const statement = statements[i];
    try {
      if (label === 'data' && (i + 1) % 25 === 0) {
        console.log(`   ▶ ${label} progress: ${i + 1}/${statements.length}`);
      }
      await client.query(statement);
    } catch (error) {
      console.error(`❌ Failed while executing ${label} statement ${i + 1}:`, error);
      console.error(`   Statement preview: ${statement.slice(0, 220)}`);
      throw error;
    }
  }
};

const quoteSqlLiteral = (value) => {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
};

const ensureReferencedParentRows = async (client, statements) => {
  const existingParentIds = {
    users: new Set(),
    books: new Set(),
    orders: new Set()
  };

  const referencedParentIds = {
    users: new Set(),
    books: new Set(),
    orders: new Set()
  };

  statements.forEach((statement) => {
    const tableName = getTableName(statement);
    if (!tableName) return;

    const values = parseInsertValues(statement);
    if (tableName === 'users') {
      const userId = normalizeId(getValueByColumnName(values, 'users', 'id'));
      if (userId) existingParentIds.users.add(userId);
    }

    if (tableName === 'books') {
      const bookId = normalizeId(getValueByColumnName(values, 'books', 'id'));
      if (bookId) existingParentIds.books.add(bookId);
    }

    if (tableName === 'orders') {
      const orderId = normalizeId(getValueByColumnName(values, 'orders', 'id'));
      if (orderId) existingParentIds.orders.add(orderId);
    }
  });

  statements.forEach((statement) => {
    const tableName = getTableName(statement);
    if (!tableName) return;

    const values = parseInsertValues(statement);
    PARENT_REFERENCE_RULES.filter((rule) => rule.childTable === tableName).forEach((rule) => {
      const referencedId = normalizeId(getValueByColumnName(values, tableName, rule.columnName));
      if (referencedId) referencedParentIds[rule.parentTable].add(referencedId);
    });
  });

  const ensureUserExists = async (userId) => {
    const normalizedId = normalizeId(userId);
    if (!normalizedId) return;

    const existing = await client.query('SELECT 1 FROM public.users WHERE id = $1', [normalizedId]);
    if (existing.rows.length > 0) {
      existingParentIds.users.add(normalizedId);
      return;
    }

    const placeholderName = 'Imported User ' + String(normalizedId).slice(0, 8);
    const placeholderEmail = String(normalizedId) + '@placeholder.local';
    const query = [
      'INSERT INTO public.users (',
      '  id, name, email, password, role, interests,',
      '  "finance_totalEarnings", "finance_monthlyEarnings", "finance_completedOrdersRevenue",',
      '  "isBlocked", "complaintCount", "createdAt", "updatedAt"',
      ') VALUES (',
      '  ' + quoteSqlLiteral(normalizedId) + ',',
      '  ' + quoteSqlLiteral(placeholderName) + ',',
      '  ' + quoteSqlLiteral(placeholderEmail) + ',',
      '  ' + quoteSqlLiteral('placeholder-password') + ',',
      "  'customer',",
      "  ARRAY['General']::character varying[],",
      '  0, 0, 0,',
      '  false, 0,',
      '  CURRENT_TIMESTAMP,',
      '  CURRENT_TIMESTAMP',
      ');'
    ].join('\n');

    await client.query(query);
    existingParentIds.users.add(normalizedId);
  };

  // Map any referenced IDs longer than 24 characters to generated 24-char IDs
  const longIdMap = new Map();
  const mapLongId = (orig) => {
    const s = String(orig);
    if (s.length <= 24) return orig;
    if (!longIdMap.has(s)) longIdMap.set(s, crypto.randomBytes(12).toString('hex'));
    return longIdMap.get(s);
  };

  // Replace in existingParentIds
  Object.keys(existingParentIds).forEach((tbl) => {
    const replacement = new Set();
    for (const id of existingParentIds[tbl]) {
      replacement.add(mapLongId(id));
    }
    existingParentIds[tbl] = replacement;
  });

  // Replace in referencedParentIds
  Object.keys(referencedParentIds).forEach((tbl) => {
    const replacement = new Set();
    for (const id of referencedParentIds[tbl]) {
      replacement.add(mapLongId(id));
    }
    referencedParentIds[tbl] = replacement;
  });

  const ensureBookExists = async (bookId) => {
    const normalizedId = normalizeId(bookId);
    if (!normalizedId) return;

    const existing = await client.query('SELECT 1 FROM public.books WHERE id = $1', [normalizedId]);
    if (existing.rows.length > 0) {
      existingParentIds.books.add(normalizedId);
      return;
    }

    let ownerId = null;
    if (existingParentIds.users.size > 0) {
      ownerId = Array.from(existingParentIds.users)[0];
    }

    if (!ownerId) {
      await ensureUserExists(crypto.randomBytes(12).toString('hex'));
      ownerId = Array.from(existingParentIds.users)[0];
    }

    const query = [
      'INSERT INTO public.books (',
      '  id, title, author, description, condition, category, "exchangeType", price,',
      '  "rentWeek", "rentMonth", "securityDeposit", images, image, pdf, subject, duration,',
      '  status, views, "ownerId", "createdAt", "updatedAt"',
      ') VALUES (',
      '  ' + quoteSqlLiteral(normalizedId) + ',',
      '  ' + quoteSqlLiteral('Imported Book ' + String(normalizedId).slice(0, 8)) + ',',
      '  ' + quoteSqlLiteral('Imported Author') + ',',
      '  ' + quoteSqlLiteral('Placeholder book imported during backup restore.') + ',',
      "  'New',",
      "  'Other',",
      "  'Sell',",
      '  0, 0, 0, 0,',
      '  ARRAY[]::text[],',
      '  NULL,',
      '  NULL,',
      '  NULL,',
      '  NULL,',
      "  'Available',",
      '  0,',
      '  ' + quoteSqlLiteral(ownerId) + ',',
      '  CURRENT_TIMESTAMP,',
      '  CURRENT_TIMESTAMP',
      ');'
    ].join('\n');

    await client.query(query);
    existingParentIds.books.add(normalizedId);
  };

  const ensureOrderExists = async (orderId) => {
    const normalizedId = normalizeId(orderId);
    if (!normalizedId) return;

    const existing = await client.query('SELECT 1 FROM public.orders WHERE id = $1', [normalizedId]);
    if (existing.rows.length > 0) {
      existingParentIds.orders.add(normalizedId);
      return;
    }

    let buyerId = null;
    let sellerId = null;
    if (existingParentIds.users.size > 0) {
      const userIds = Array.from(existingParentIds.users);
      buyerId = userIds[0];
      sellerId = userIds[0];
    }

    if (!buyerId || !sellerId) {
      await ensureUserExists(crypto.randomBytes(12).toString('hex'));
      await ensureUserExists(crypto.randomBytes(12).toString('hex'));
      const userIds = Array.from(existingParentIds.users);
      buyerId = userIds[0];
      sellerId = userIds[1] || userIds[0];
    }

    const query = [
      'INSERT INTO public.orders (',
      '  id, "buyerId", "sellerId", "bookAmount", "deliveryFee", "totalAmount",',
      '  "shippingAddress", "shippingPhone", "shippingName", "trackingData", "paymentData",',
      '  status, "complainReason", "createdAt", "updatedAt"',
      ') VALUES (',
      '  ' + quoteSqlLiteral(normalizedId) + ',',
      '  ' + quoteSqlLiteral(buyerId) + ',',
      '  ' + quoteSqlLiteral(sellerId) + ',',
      '  0, 0, 0,',
      '  NULL, NULL, NULL,',
      "  '{}'::jsonb, '{}'::jsonb,",
      "  'pending',",
      '  NULL,',
      '  CURRENT_TIMESTAMP,',
      '  CURRENT_TIMESTAMP',
      ');'
    ].join('\n');

    await client.query(query);
    existingParentIds.orders.add(normalizedId);
  };

  for (const userId of referencedParentIds.users) {
    if (!existingParentIds.users.has(userId)) {
      await ensureUserExists(userId);
    }
  }

  for (const bookId of referencedParentIds.books) {
    if (!existingParentIds.books.has(bookId)) {
      await ensureBookExists(bookId);
    }
  }

  for (const orderId of referencedParentIds.orders) {
    if (!existingParentIds.orders.has(orderId)) {
      await ensureOrderExists(orderId);
    }
  }
};

const main = async () => {
  try {
    console.log('Step 1: Connecting to Supabase via pg client to restore data...');
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('Connected successfully!');

    console.log('Reading local_backup.sql...');
    const sqlPath = path.join(__dirname, 'local_backup.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Backup file not found at ${sqlPath}. Make sure local_backup.sql is in the backend folder.`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('Cleaning SQL content (filtering psql backslash commands)...');
    const cleanSql = sql
      .split(/\r?\n/)
      .filter((line) => !line.trim().startsWith('\\'))
      .join('\n');

    const statements = splitSqlStatements(cleanSql);
    console.log(`Parsed ${statements.length} SQL statements.`);

    const preDataStatements = [];
    const dataStatements = [];
    const postDataStatements = [];
    let seenData = false;

    statements.forEach((statement) => {
      if (isDataStatement(statement)) {
        seenData = true;
        dataStatements.push(statement);
      } else if (!seenData) {
        preDataStatements.push(statement);
      } else {
        postDataStatements.push(statement);
      }
    });

    console.log(`Preparing ${preDataStatements.length} schema statements, ${dataStatements.length} data statements, and ${postDataStatements.length} post-data statements.`);

    console.log('Executing schema and DDL statements...');
    await client.query('BEGIN');
    await executeStatements(client, preDataStatements, 'schema');

    console.log('Sanitizing data statements (clamping long IDs and truncating overlong fields)');
    const sanitizedDataStatements = sanitizeDataStatementsPrecise(dataStatements);

    console.log('Creating placeholder parent rows for missing foreign-key references...');
    await ensureReferencedParentRows(client, sanitizedDataStatements);

    console.log('Executing data restore in dependency order...');
    await executeStatements(client, orderDataStatements(sanitizedDataStatements), 'data');

    console.log('Executing remaining post-data statements...');
    await executeStatements(client, postDataStatements, 'post-data');

    await client.query('COMMIT');
    console.log('🎉 Database schema and data restored successfully!');
    await client.end();
  } catch (err) {
    console.error('❌ Error during import process:', err);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
};

main();
