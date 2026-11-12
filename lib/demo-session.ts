import {db,limited} from "./checkout-store";

export const SESSION_COOKIE="__Host-planpilot-demo";
export const DEMO_SECONDS=24*60*60;
export type DemoUser={userId:string;email:string;displayName:string;isDemo:true};
export async function tokenHash(value:string){const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");}
export async function demoVisitorKey(request:Request){return tokenHash(request.headers.get("cf-connecting-ip")??"unavailable");}
export async function readDemoSession(token:string):Promise<DemoUser|null>{
 if(!/^demo\.[a-f0-9]{64}$/.test(token))return null;
 const row=await db().prepare("SELECT owner,expires FROM demo_sessions WHERE token_hash=? AND expires>?").bind(await tokenHash(token),Date.now()).first<{owner:string;expires:number}>();
 return row?{userId:row.owner,email:"",displayName:"Demo guest",isDemo:true}:null;
}
export async function createDemoSession(request:Request){
 const day=new Date().toISOString().slice(0,10);
 if(await limited("demo-start:"+await demoVisitorKey(request)+":"+day,20)||await limited("demo-start-global:"+day,200))return null;
 // Remove temporary drafts and pricing-only pages; sandbox checkout audit records remain inaccessible after expiry.
 const expired="SELECT owner FROM demo_sessions WHERE expires<=?";
 const now=Date.now();
 await db().batch([db().prepare("DELETE FROM pricing_chats WHERE owner IN ("+expired+")").bind(now),db().prepare("DELETE FROM projects WHERE owner IN ("+expired+") AND json_extract(config,'$.pricingOnly')=1").bind(now),db().prepare("DELETE FROM demo_paypal_resources WHERE owner IN ("+expired+")").bind(now),db().prepare("DELETE FROM demo_sessions WHERE expires<=?").bind(now)]);
 const token="demo."+Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,"0")).join("");
 const owner="demo:"+crypto.randomUUID();
 await db().prepare("INSERT INTO demo_sessions (token_hash,owner,expires,created) VALUES (?,?,?,?)").bind(await tokenHash(token),owner,now+DEMO_SECONDS*1000,now).run();
 return token;
}
export async function revokeDemoSession(token:string){if(!/^demo\.[a-f0-9]{64}$/.test(token))return;const hash=await tokenHash(token);const owner="SELECT owner FROM demo_sessions WHERE token_hash=?";await db().batch([db().prepare("DELETE FROM pricing_chats WHERE owner IN ("+owner+")").bind(hash),db().prepare("DELETE FROM projects WHERE owner IN ("+owner+") AND json_extract(config,'$.pricingOnly')=1").bind(hash),db().prepare("DELETE FROM demo_paypal_resources WHERE owner IN ("+owner+")").bind(hash),db().prepare("DELETE FROM demo_sessions WHERE token_hash=?").bind(hash)]);}

export async function rememberDemoResource(owner:string,id:string,kind:"plan"|"subscription"){await db().prepare("INSERT INTO demo_paypal_resources (id,owner,kind) VALUES (?,?,?) ON CONFLICT(id) DO NOTHING").bind(id,owner,kind).run();await requireDemoResource(owner,id,kind);}
export async function requireDemoResource(owner:string,id:string,kind:"plan"|"subscription"){const found=await db().prepare("SELECT id FROM demo_paypal_resources WHERE id=? AND owner=? AND kind=?").bind(id,owner,kind).first();if(!found)throw new Error("This sandbox resource does not belong to this demo.");}
export async function demoPaymentLimit(user:{userId:string;isDemo?:boolean}){return !!user.isDemo&&(await limited("demo-paypal:"+user.userId+":"+new Date().toISOString().slice(0,10),10)||await limited("demo-paypal-global:"+new Date().toISOString().slice(0,10),100));}
