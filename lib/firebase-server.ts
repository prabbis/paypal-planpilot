import {env} from "@/lib/runtime-env";
type Account={project_id:string;client_email:string;private_key:string};
let cached:{value:string;expires:number}|undefined;
export function firebaseAccount():Account{const raw=(env as Record<string,string>).FIREBASE_SERVICE_ACCOUNT_JSON;if(!raw)throw new Error("Firebase server credentials are not configured.");const a=JSON.parse(raw) as Account;if(!a.project_id||!a.client_email||!a.private_key)throw new Error("Firebase server credentials are incomplete.");const configured=(env as Record<string,string>).FIREBASE_PROJECT_ID;if(configured&&a.project_id!==configured)throw new Error("Firebase server and web app project IDs must match.");return a;}
const base64url=(data:Uint8Array)=>btoa(String.fromCharCode(...data)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
const encoded=(value:unknown)=>base64url(new TextEncoder().encode(JSON.stringify(value)));
export async function firebaseAccessToken(){
 if(cached&&cached.expires>Date.now()+60000)return cached.value;
 const a=firebaseAccount(),now=Math.floor(Date.now()/1000),payload=encoded({alg:"RS256",typ:"JWT"})+"."+encoded({iss:a.client_email,scope:"https://www.googleapis.com/auth/cloud-platform",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600});
 const bytes=Uint8Array.from(atob(a.private_key.replace(/-----[^-]+-----|\s/g,"")),c=>c.charCodeAt(0));const key=await crypto.subtle.importKey("pkcs8",bytes,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["sign"]);const sig=await crypto.subtle.sign("RSASSA-PKCS1-v1_5",key,new TextEncoder().encode(payload));
 const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:payload+"."+base64url(new Uint8Array(sig))}),signal:AbortSignal.timeout(15000)});
 if(!r.ok)throw new Error("Firebase server authentication failed. Check the service account and its IAM permissions.");const d=await r.json() as {access_token:string;expires_in:number};if(!d.access_token)throw new Error("Firebase authentication did not return an access token.");cached={value:d.access_token,expires:Date.now()+d.expires_in*1000};return cached.value;
}
export async function googleRequest(url:string,options:RequestInit={}){return fetch(url,{...options,headers:{Authorization:"Bearer "+await firebaseAccessToken(),...options.headers},signal:options.signal??AbortSignal.timeout(25000)});}
