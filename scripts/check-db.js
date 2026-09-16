const fs=require("node:fs");
const path=require("node:path");
const envPath=path.join(__dirname,"..",".env");
if(fs.existsSync(envPath))process.loadEnvFile(envPath);
const db = require("../database");
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
const result = Object.fromEntries(tables.map(({ name }) => [name, db.prepare(`SELECT COUNT(*) AS count FROM "${name}"`).get().count]));
console.table(result);
const users=db.prepare("SELECT email,email_verified_at,status,created_at FROM users ORDER BY id DESC").all();
const masked=users.map(user=>{const [local,domain]=String(user.email).split("@");return {email:`${local.slice(0,2)}***@${domain}`,verified:Boolean(user.email_verified_at),status:user.status,createdAt:user.created_at}});
console.log(`Users: ${users.length}; verified: ${users.filter(user=>user.email_verified_at).length}; unverified: ${users.filter(user=>!user.email_verified_at).length}`);
console.table(masked);
const deliveries=db.prepare("SELECT recipient,kind,provider,status,error_message,created_at FROM email_deliveries ORDER BY id DESC LIMIT 10").all().map(row=>{const [local,domain]=String(row.recipient).split("@");return {...row,recipient:`${local.slice(0,2)}***@${domain}`}});
if(deliveries.length){console.log("Recent email deliveries:");console.table(deliveries)}
