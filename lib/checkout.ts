import {accessToken,paypal} from "./paypal";
import {db,project,publicEndpoint,setting,type Session,type Config} from "./checkout-store";
export async function authoritative(session:Session,token?:string){
 if(!session.subscription)throw new Error("Subscription is pending.");
 const sub=await paypal(token??await accessToken(),"/v1/billing/subscriptions/"+session.subscription);
 if(sub.plan_id!==session.plan||sub.custom_id!==session.reference)throw new Error("Subscription does not match this checkout.");
 await db().prepare("UPDATE sessions SET status=? WHERE id=?").bind(String(sub.status),session.id).run();
 return sub;
}
export async function signature(secret:string,timestamp:string,body:string){const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);const bytes=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(timestamp+"."+body));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,"0")).join("");}
export async function deliver(id:string){
 const event=await db().prepare("SELECT * FROM deliveries WHERE id=?").bind(id).first<{id:string;project:string;body:string;delivered:number}>();
 if(!event||event.delivered)return true;
 const p=await project(event.project);if(!p)throw new Error("Published project unavailable.");const config=JSON.parse(p.config) as Config;
 if(!config.webhook){await db().prepare("UPDATE deliveries SET delivered=1 WHERE id=?").bind(id).run();return true;}
 await db().prepare("UPDATE deliveries SET attempts=attempts+1 WHERE id=?").bind(id).run();
 try{const data=JSON.parse(event.body) as {subscriptionId:string;status:string};const session=await db().prepare("SELECT * FROM sessions WHERE subscription=?").bind(data.subscriptionId).first<Session>();if(!session)throw new Error("Checkout session unavailable.");const current=await authoritative(session);data.status=String(current.status);const body=JSON.stringify(data);await db().prepare("UPDATE deliveries SET body=? WHERE id=?").bind(body,id).run();await publicEndpoint(config.webhook);const timestamp=String(Math.floor(Date.now()/1000));const response=await fetch(config.webhook,{method:"POST",headers:{"Content-Type":"application/json","PlanPilot-Event-Id":event.id,"PlanPilot-Timestamp":timestamp,"PlanPilot-Signature":"sha256="+await signature(p.secret,timestamp,body)},body,redirect:"manual",signal:AbortSignal.timeout(8000)});if(!response.ok)return false;await db().prepare("UPDATE deliveries SET delivered=1 WHERE id=?").bind(id).run();return true;}catch{return false;}
}
export async function verifyPayPal(raw:string,headers:Headers){
 const cert=headers.get("paypal-cert-url"),transmission=headers.get("paypal-transmission-id"),time=headers.get("paypal-transmission-time"),sig=headers.get("paypal-transmission-sig"),algo=headers.get("paypal-auth-algo");
 if(!cert||!transmission||!time||!sig||!algo)return false;
 const url=new URL(cert);if(url.protocol!=="https:"||url.username||url.password||url.port||!(url.hostname==="paypal.com"||url.hostname.endsWith(".paypal.com")))return false;
 const webhookId=await setting("paypal-webhook-id");if(!webhookId)throw new Error("PayPal webhook is not registered.");
 const fields={auth_algo:algo,cert_url:cert,transmission_id:transmission,transmission_sig:sig,transmission_time:time,webhook_id:webhookId};
 // Preserve the original event JSON bytes when constructing PayPal's postback.
 const body=JSON.stringify(fields).slice(0,-1)+',"webhook_event":'+raw+'}';
 const token=await accessToken();const r=await fetch("https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature",{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},body,signal:AbortSignal.timeout(15000)});
 if(!r.ok)throw new Error("PayPal verification is unavailable.");return (await r.json() as {verification_status:string}).verification_status==="SUCCESS";
}
