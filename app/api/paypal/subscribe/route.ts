import {SITE} from "@/lib/checkout-store";
import {demoPaymentLimit,rememberDemoResource,requireDemoResource} from "@/lib/demo-session";
import {authGuard,firebaseUser} from "@/lib/firebase-auth";
import {billingToken} from "@/lib/billing-auth";
import {accessToken,paypal,routeError} from "@/lib/paypal";
import {z} from "zod";
export const dynamic="force-dynamic";
const ORIGIN=SITE;
export async function POST(request:Request){
 const denied=await authGuard();if(denied)return denied;
 if(request.headers.get("origin")!==ORIGIN)return Response.json({error:"Request origin is not allowed."},{status:403});
 let input;try{input=z.object({storeId:z.string().uuid().optional(),planId:z.string().regex(/^P-[A-Z0-9]{10,40}$/),requestId:z.string().uuid()}).parse(await request.json());}catch{return Response.json({error:"A valid sandbox plan is required."},{status:400});}
 try{const user=(await firebaseUser())!;if(await demoPaymentLimit(user))return Response.json({error:"Today’s sandbox demo payment allowance has been used."},{status:429});if(user.isDemo){await requireDemoResource(user.userId,input.planId,"plan");input.requestId=user.userId.slice(5)+"-"+input.requestId;}const token=await billingToken(input.storeId);await paypal(token,"/v1/billing/plans/"+input.planId);const sub=await paypal(token,"/v1/billing/subscriptions",{plan_id:input.planId,application_context:{brand_name:"PlanPilot",user_action:"SUBSCRIBE_NOW",return_url:ORIGIN+"/?checkout=approved",cancel_url:ORIGIN+"/?checkout=cancelled"}},input.requestId);
 const links=sub.links as {rel:string;href:string}[];const url=links?.find(l=>l.rel==="approve")?.href;if(!url||new URL(url).hostname!=="www.sandbox.paypal.com")throw new Error();if(user.isDemo)await rememberDemoResource(user.userId,String(sub.id),"subscription");return Response.json({approvalUrl:url,subscriptionId:sub.id},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return routeError(e);}
}
export async function GET(request:Request){const denied=await authGuard();if(denied)return denied;const id=new URL(request.url).searchParams.get("id");if(!id||!/^I-[A-Z0-9]{5,40}$/.test(id))return Response.json({error:"Invalid subscription ID."},{status:400});try{const user=(await firebaseUser())!;if(user.isDemo)await requireDemoResource(user.userId,id,"subscription");const token=await billingToken(new URL(request.url).searchParams.get("store")??undefined);const sub=await paypal(token,"/v1/billing/subscriptions/"+id);return Response.json({id:sub.id,status:sub.status,planId:sub.plan_id},{headers:{"Cache-Control":"no-store"}});}catch(e){return routeError(e);}}
