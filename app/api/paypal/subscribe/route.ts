import {accessToken,paypal,routeError} from "@/lib/paypal";
import {z} from "zod";
export const dynamic="force-dynamic";
const ORIGIN="https://planpilot-prabbis-demo.abisolaadeniran.chatgpt.site";
export async function POST(request:Request){
 if(request.headers.get("origin")!==ORIGIN)return Response.json({error:"Request origin is not allowed."},{status:403});
 let input;try{input=z.object({planId:z.string().regex(/^P-[A-Z0-9]{10,40}$/),requestId:z.string().uuid()}).parse(await request.json());}catch{return Response.json({error:"A valid sandbox plan is required."},{status:400});}
 try{const token=await accessToken();await paypal(token,"/v1/billing/plans/"+input.planId);const sub=await paypal(token,"/v1/billing/subscriptions",{plan_id:input.planId,application_context:{brand_name:"PlanPilot",user_action:"SUBSCRIBE_NOW",return_url:ORIGIN+"/?checkout=approved",cancel_url:ORIGIN+"/?checkout=cancelled"}},input.requestId);
 const links=sub.links as {rel:string;href:string}[];const url=links?.find(l=>l.rel==="approve")?.href;if(!url||new URL(url).hostname!=="www.sandbox.paypal.com")throw new Error();return Response.json({approvalUrl:url,subscriptionId:sub.id},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return routeError(e);}
}
export async function GET(request:Request){const id=new URL(request.url).searchParams.get("id");if(!id||!/^I-[A-Z0-9]{5,40}$/.test(id))return Response.json({error:"Invalid subscription ID."},{status:400});try{const token=await accessToken();const sub=await paypal(token,"/v1/billing/subscriptions/"+id);return Response.json({id:sub.id,status:sub.status,planId:sub.plan_id},{headers:{"Cache-Control":"no-store"}});}catch(e){return routeError(e);}}
