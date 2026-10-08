import {db,failure,type Session} from "@/lib/checkout-store";
import {authoritative,deliver,verifyPayPal} from "@/lib/checkout";
export const dynamic="force-dynamic";
export async function POST(request:Request){
 try{if(Number(request.headers.get("content-length")??0)>100000)return new Response(null,{status:413});const raw=await request.text();if(raw.length>100000)return new Response(null,{status:413});
 if(!await verifyPayPal(raw,request.headers))return Response.json({error:"Invalid PayPal signature."},{status:401});
 const event=JSON.parse(raw) as {id:string;event_type:string;create_time:string;resource:{id?:string;billing_agreement_id?:string;custom_id?:string}};
 if(!event.id||event.id.length>100||!event.event_type)return new Response(null,{status:400});
 const existing=await db().prepare("SELECT id FROM deliveries WHERE id=?").bind(event.id).first();if(existing)return new Response(null,{status:await deliver(event.id)?200:503});
 const relevant=event.event_type.startsWith("BILLING.SUBSCRIPTION.")||event.event_type.startsWith("PAYMENT.SALE.");if(!relevant)return new Response(null,{status:200});
 const subId=event.event_type.startsWith("BILLING.SUBSCRIPTION.")?event.resource.id:event.resource.billing_agreement_id;if(!subId||!/^I-[A-Z0-9]{5,40}$/.test(subId))return new Response(null,{status:200});
 let session=await db().prepare("SELECT * FROM sessions WHERE subscription=?").bind(subId).first<Session>();
 // PayPal may send the event before the creation request has saved its response.
 if(!session&&event.resource.custom_id)session=await db().prepare("SELECT * FROM sessions WHERE reference=?").bind(event.resource.custom_id).first<Session>();
 if(!session)return new Response(null,{status:200}); // Not a subscription created by this public checkout.
 if(!session.subscription)return new Response(null,{status:503});
 const sub=await authoritative(session);const body=JSON.stringify({id:event.id,type:event.event_type,occurredAt:event.create_time,projectId:session.project,subscriptionId:session.subscription,customerReference:session.reference,status:sub.status,planId:session.plan});
 await db().prepare("INSERT INTO deliveries (id,project,body,created) VALUES (?,?,?,?) ON CONFLICT(id) DO NOTHING").bind(event.id,session.project,body,Date.now()).run();
 // Failed forwarding stays in D1. A non-2xx asks PayPal to retry its signed event.
 return new Response(null,{status:await deliver(event.id)?200:503});
 }catch(e){return failure(e);}
}
