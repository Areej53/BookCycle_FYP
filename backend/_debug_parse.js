const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'db-test-import.js');
const src = fs.readFileSync(file, 'utf8');
console.log('length', src.length);
for (let i = 0; i < src.length; i++) {
  const ch = src[i];
  if (ch === '\n') continue;
  if (ch === '\r') continue;
  if (ch === '\t') continue;
  if (ch === '"' || ch === "'" || ch === '`') {
    console.log(i, JSON.stringify(ch));
  }
}
try {
  new Function(src);
  console.log('parsed ok');
} catch (err) {
  console.error(err.stack);
  const line = src.slice(0, err && err.column ? err.column : 0).split(/\r?\n/).length;
  console.log('line', line);
  console.log(src.split(/\r?\n/).slice(Math.max(0, line - 5), line + 5).join('\n'));
}
