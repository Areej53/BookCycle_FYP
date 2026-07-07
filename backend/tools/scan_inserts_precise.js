const fs = require('fs');
const path = require('path');
const sql = fs.readFileSync(path.join(__dirname,'..','local_backup.sql'),'utf8');
const inserts = sql.match(/INSERT INTO\s+public\.[^;]+;/ig) || [];
console.log('Found', inserts.length, 'INSERT statements');

const tableDefs = {
  books: ['id','title','author','description','condition','category','exchangeType','price','rentWeek','rentMonth','securityDeposit','images','image','pdf','subject','duration','status','views','ownerId','createdAt','updatedAt'],
  notifications: ['id','userId','message','type','actionLink','orderId','isRead','createdAt','updatedAt'],
  order_items: ['id','orderId','bookId','title','type','price','quantity'],
  orders: ['id','buyerId','sellerId','bookAmount','deliveryFee','totalAmount','shippingAddress','shippingPhone','shippingName','trackingData','paymentData','status','complainReason','createdAt','updatedAt'],
  transactions: ['id','book','requester','owner','exchangeType','status','message','createdAt','updatedAt'],
  user_viewed_books: ['id','userId','bookId','category','views','createdAt','updatedAt']
};

const limits = {
  id:24, title:255, author:255, condition:20, category:30, exchangeType:20, ownerId:24,
  userId:24, actionLink:255, orderId:24, bookId:24, buyerId:24, sellerId:24, shippingPhone:50, shippingName:100, status:30, book:24, requester:24, owner:24, type:20, message:null, image: null
};

function parseValues(stmt){
  const m = stmt.match(/VALUES\s*(\([\s\S]*\))\s*;$/i);
  if(!m) return [];
  const raw = m[1];
  const res=[]; let cur=''; let inQ=false; let depth=0;
  for(let i=1;i<raw.length-1;i++){
    const ch=raw[i]; const next=raw[i+1];
    if(ch==="'"){
      cur+=ch;
      if(inQ && next==="'"){ cur+="'"; i++; continue; }
      inQ=!inQ; continue;
    }
    if(!inQ){ if(ch==='('){ depth++; cur+=ch; continue;} if(ch===')'){ depth--; cur+=ch; continue;} if(ch===',' && depth===0){ res.push(cur.trim()); cur=''; continue;} }
    cur+=ch;
  }
  if(cur.trim()) res.push(cur.trim());
  return res;
}

const problems=[];
for(const stmt of inserts){
  const tmatch = stmt.match(/INSERT INTO\s+public\.(\w+)/i);
  if(!tmatch) continue;
  const table = tmatch[1];
  const cols = tableDefs[table];
  if(!cols) continue;
  const vals = parseValues(stmt);
  if(vals.length !== cols.length){ /* allow mismatch */ }
  for(let i=0;i<Math.min(vals.length, cols.length); i++){
    const col = cols[i];
    const lim = limits[col];
    if(!lim) continue;
    const v = vals[i];
    const m = v.match(/^'(.*)'$/s);
    if(!m) continue;
    const content = m[1].replace(/''/g, "'");
    if(content.length>lim){ problems.push({table,col,limit:lim,length:content.length,snippet:content.slice(0,120)}); }
  }
}

console.log('Detected', problems.length, 'exact length violations');
fs.writeFileSync('scan_precise_report.json', JSON.stringify(problems,null,2));
console.log('Wrote scan_precise_report.json');
