import { env } from "cloudflare:workers";
// Sandbox only. Never select the API host from a browser input or credential.
const API="https://api-m.sandbox.paypal.com";
const secrets=()=>env as unknown as Record<string,string|undefined>;
export class PayPalError extends Error{constructor(message:string,public status=502){super(message);}}
export async function accessToken(){
 const {PAYPAL_CLIENT_ID:id,PAYPAL_CLIENT_SECRET:secret}=secrets();
 if(!id||!secret)throw new PayPalError("PayPal sandbox credentials are not configured.",503);
 const response=await fetch(API+"/v1/oauth2/token",{method:"POST",headers:{Authorization:"Basic "+btoa(id+":"+secret),"Content-Type":"application/x-www-form-urlencoded"},body:"grant_type=client_credentials",signal:AbortSignal.timeout(20000)});
 const data=await response.json() as {access_token?:string};
 if(!response.ok||!data.access_token)throw new PayPalError("PayPal sandbox authentication failed. Check that both credentials belong to a sandbox app.");
 return data.access_token;
}
export async function paypal(token:string,path:string,body?:unknown,requestId?:string){
 const response=await fetch(API+path,{method:body?"POST":"GET",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json",Prefer:"return=representation",...(requestId?{"PayPal-Request-Id":requestId}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(25000)});
 const data=await response.json() as Record<string,unknown>;
 if(!response.ok){const name=typeof data.name==="string"?data.name:"REQUEST_FAILED";throw new PayPalError(`PayPal sandbox returned ${name}. Review the request and retry; earlier successful plans may already exist.`);}
 return data;
}
export function routeError(e:unknown){return Response.json({error:e instanceof PayPalError?e.message:"The sandbox request could not complete. Please retry."},{status:e instanceof PayPalError?e.status:502,headers:{"Cache-Control":"no-store"}});}
