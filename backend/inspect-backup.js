const fs = require('fs');
const path = require('path');
const sqlPath = path.join(__dirname, 'local_backup.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');
const cleanSql = sql.split('\n').filter((line) => !line.trim().startsWith('\\')).join('\n');

const splitStatements = (input) => {
  const out = [];
  let current = '';
  let inSingleQuote = false;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    const next = input[i + 1];
    if (ch === "'") {
      if (inSingleQuote && next === "'") {
        current += "''";
        i += 1;
      } else {
        inSingleQuote = !inSingleQuote;
        current += ch;
      }
      continue;
    }
    if (!inSingleQuote && ch === ';') {
      const trimmed = current.trim();
      if (trimmed) out.push(trimmed);
      current = '';
      continue;
    }
    current += ch;
  }
  const last = current.trim();
  if (last) out.push(last);
  return out;
};

const statements = splitStatements(cleanSql);
console.log('statement count', statements.length);
for (let i = 0; i < statements.length; i += 1) {
  if (i >= 40 && i <= 55) {
    console.log(`--- statement ${i + 1} ---`);
    console.log(statements[i]);
    console.log();
  }
}
