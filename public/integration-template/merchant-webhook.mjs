import 'dotenv/config';
import express from 'express';
import {createHmac,timingSafeEqual} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
const secret=process.env.PLANPILOT_WEBHOOK_SECRET;if(!secret)throw new Error('Set PLANPILOT_WEBHOOK_SECRET.');
mkdirSync('data',{recursive:true});const ledger=new DatabaseSync('data/events.sqlite');ledger.exec('CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, completed INTEGER NOT NULL)');
const app=express();
async function onSubscriptionEvent(event){
 // Replace with your app's idempotent API call or entitlement transaction.
 // Use verified status: ACTIVE grants access; other statuses can revoke it.
 // Match customerReference to an authenticated account using your own backend.
 throw new Error('Implement onSubscriptionEvent before enabling webhook delivery.');
}
app.post('/api/subscription-webhook',express.raw({type:'application/json',limit:'100kb'}),async(req,res)=>{
 const timestamp=req.get('PlanPilot-Timestamp'),header=req.get('PlanPilot-Signature');
 if(!timestamp||!header||!/^\d+$/.test(timestamp)||Math.abs(Date.now()/1000-Number(timestamp))>300)return res.sendStatus(401);
 const actual=Buffer.from(header.replace(/^sha256=/,''),'hex'),expected=createHmac('sha256',secret).update(timestamp+'.').update(req.body).digest();
 if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return res.sendStatus(401);
 try{const event=JSON.parse(req.body.toString('utf8'));if(typeof event.id!=='string'||event.id!==req.get('PlanPilot-Event-Id'))return res.sendStatus(400);if(ledger.prepare('SELECT completed FROM events WHERE id=?').get(event.id)?.completed)return res.sendStatus(200);
 await onSubscriptionEvent(event);ledger.prepare('INSERT INTO events (id,completed) VALUES (?,1) ON CONFLICT(id) DO UPDATE SET completed=1').run(event.id);return res.sendStatus(200);
 }catch{return res.sendStatus(503);}
});
app.listen(Number(process.env.PORT??3000));
