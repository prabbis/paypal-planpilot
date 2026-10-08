import {merchantGuard} from "@/lib/merchant-auth";
import { accessToken, paypal, routeError } from "@/lib/paypal";
import { z } from "zod";
export const dynamic="force-dynamic";
const ORIGIN="https://planpilot-prabbis-demo.abisolaadeniran.chatgpt.site";
const schema=z.object({requestId:z.string().uuid(),title:z.string().trim().min(1).max(127),description:z.string().max(4000),annual:z.boolean(),approved:z.literal(true),plans:z.array(z.object({name:z.string().trim().min(1).max(30),price:z.number().finite().min(1).max(100000),seats:z.number().int().min(1).max(10000),units:z.number().int().min(1).max(1000000),features:z.array(z.string().max(200)).max(30)})).length(3)});
// Server-side owner authorization protects this shared sandbox merchant.
export async function GET(){const denied=await merchantGuard();if(denied)return denied;try{await accessToken();return Response.json({connected:true,environment:"sandbox",merchant:"Configured sandbox business account"},{headers:{"Cache-Control":"no-store"}});}catch(e){return routeError(e);}}
export async function POST(request:Request){
 const denied=await merchantGuard();if(denied)return denied;
 if(request.headers.get("origin")!==ORIGIN)return Response.json({error:"Request origin is not allowed."},{status:403});
 if(Number(request.headers.get("content-length")??0)>25000)return Response.json({error:"Request is too large."},{status:413});
 let input;try{const text=await request.text();if(text.length>25000)throw new Error();input=schema.parse(JSON.parse(text));}catch{return Response.json({error:"Provide three valid tiers and explicitly approve the prices."},{status:400});}
 const results:{id:string;name:string;amount:string;status:string}[]=[];let productId="";
 try{
 const token=await accessToken();
 const product=await paypal(token,"/v1/catalogs/products",{name:input.title,description:input.description.slice(0,256),type:"SERVICE",category:"SOFTWARE"},input.requestId+"-p");
 productId=String(product.id??"");if(!/^PROD-[A-Z0-9]+$/.test(productId))throw new Error();
 for(let i=0;i<input.plans.length;i++){
 const p=input.plans[i],amount=(input.annual?p.price*12*.8:p.price).toFixed(2);
 const plan=await paypal(token,"/v1/billing/plans",{product_id:productId,name:p.name,description:`${p.seats} users; ${p.units} monthly usage units. Access limits are enforced by the application.`,status:"ACTIVE",billing_cycles:[{frequency:{interval_unit:input.annual?"YEAR":"MONTH",interval_count:1},tenure_type:"REGULAR",sequence:1,total_cycles:0,pricing_scheme:{fixed_price:{value:amount,currency_code:"CAD"}}}],payment_preferences:{auto_bill_outstanding:true,setup_fee_failure_action:"CANCEL",payment_failure_threshold:3}},input.requestId+"-"+i);
 if(typeof plan.id!=="string"||!/^P-[A-Z0-9]+$/.test(plan.id))throw new Error();results.push({id:plan.id,name:p.name,amount,status:String(plan.status)});
 }
 return Response.json({environment:"sandbox",productId,plans:results},{headers:{"Cache-Control":"no-store"}});
 }catch(e){const response=routeError(e);const data=await response.json() as {error:string};return Response.json({...data,productId,plans:results},{status:response.status});}
}
