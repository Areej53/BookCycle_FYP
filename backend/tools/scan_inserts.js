const fs = require('fs');
const path = require('path');
const sql = fs.readFileSync(path.join(__dirname,'..','local_backup.sql'),'utf8');
const inserts = sql.match(/INSERT INTO[\s\S]*?;\n/ig) || [];
console.log('Found', inserts.length, 'INSERT statements');

const schema = {
  books: { id:24, title:255, author:255, description: null, condition:20, category:30, exchangeType:20, ownerId:24 },
  notifications: { id:24, userId:24, message: null, type:20, actionLink:255, orderId:24 },
  order_items: { id: null, orderId:24, bookId:24, title:255, type:20 },
  orders: { id:24, buyerId:24, sellerId:24, shippingPhone:50, shippingName:100, status:30 },
  transactions: { id:24, book:24, requester:24, owner:24, exchangeType:20, status:20 },
  user_viewed_books: { userId:24, bookId:24, category:50 }
};

function getTable(stmt){
  const m = stmt.match(/INSERT\s+INTO\s+(?:ONLY\s+)?public\.(\w+)/i);
  return m && m[1].toLowerCase();
}

function parseValues(stmt){
  const m = stmt.match(/VALUES\s*(\([\s\S]*\))\s*;$/i);
  if(!m) return [];
  const raw = m[1];
  // naive split on ',' at top level, handling quotes
  const res=[];
  let cur=''; let inQ=false; let depth=0;
  for(let i=1;i<raw.length-1;i++){ // skip surrounding ()
    const ch=raw[i];
    const next=raw[i+1];
    if(ch==="'"){
      cur+=ch;
      if(inQ && next==="'"){ cur+="'"; i++; continue;} 
      inQ=!inQ; continue;
    }
    if(!inQ){
      if(ch==='(') { depth++; cur+=ch; continue; }
      if(ch===')') { depth--; cur+=ch; continue; }
      if(ch===',' && depth===0){ res.push(cur.trim()); cur=''; continue; }
    }
    cur+=ch;
  }
  if(cur.trim()) res.push(cur.trim());
  return res;
}

const problems=[];
for(const stmt of inserts){
  const table = getTable(stmt);
  if(!table || !schema[table]) continue;
  const vals = parseValues(stmt);
  const cols = Object.keys(schema[table]);
  for(const col of cols){
    const limit = schema[table][col];
    if(!limit) continue;
    const idx = col==='id' || col==='userId' ? 0 : null; // best-effort mapping: many schemas use positions but simplified
    // Instead, try to detect by names is hard; we'll search any quoted string longer than limit in stmt
  }
  // generic scan: find all string literals and test length
  const strLits = Array.from(stmt.matchAll(/'(.*?)'/gs)).map(m=>m[1].replace(/''/g, "'"));
  for(const s of strLits){
    for(const [t,colsDef] of Object.entries(schema)){
      for(const [col, lim] of Object.entries(colsDef)){
        if(!lim) continue;
        if(s.length>lim){
          problems.push({table, col, limit:lim, length:s.length, sample: s.slice(0,80)});
        }
      }
    }
  }
}

// dedupe
const uniq = [];
const seen = new Set();
for(const p of problems){
  const key = `${p.table}|${p.col}|${p.length}`;
  if(seen.has(key)) continue; seen.add(key); uniq.push(p);
}
console.log('Found',uniq.length,'potential length problems');
console.log(JSON.stringify(uniq.slice(0,40),null,2));
fs.writeFileSync('scan_report.json', JSON.stringify(uniq,null,2));
console.log('Wrote scan_report.json');
