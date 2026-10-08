import {env} from "cloudflare:workers";
import {cookies} from "next/headers";
export type FirebaseUser={userId:string;email:string;displayName:string};
export function firebaseConfig(){const e=env as unknown as Record<string,string>;return {apiKey:e.FIREBASE_APIKEY,authDomain:e.FIREBASE_AUTHDOMAIN,projectId:e.FIREBASE_PROJECT_ID,appId:e.FIREBASE_APPID};}
export async function verifyFirebase(token:string):Promise<FirebaseUser|null>{
 try{const config=firebaseConfig();if(!config.apiKey||!config.projectId||token.length>10000)return null;
 const middle=token.split(".")[1];if(!middle)return null;const claims=JSON.parse(atob(middle.replace(/-/g,"+").replace(/_/g,"/"))) as {aud:string;iss:string;exp:number;sub:string};
 if(claims.aud!==config.projectId||claims.iss!=="https://securetoken.google.com/"+config.projectId||claims.exp<=Date.now()/1000||!claims.sub)return null;
 // Google verifies the actual signed ID token; decoded claims alone never grant access.
 const r=await fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key="+encodeURIComponent(config.apiKey),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:token}),signal:AbortSignal.timeout(10000)});
 if(!r.ok)return null;const data=await r.json() as {users?:{localId:string;email:string;emailVerified:boolean;disabled?:boolean;displayName?:string}[]};const u=data.users?.[0];if(!u||u.disabled||!u.emailVerified||u.localId!==claims.sub)return null;return {userId:u.localId,email:u.email,displayName:u.displayName??u.email};
 }catch{return null;}
}
export async function firebaseUser(){const token=(await cookies()).get("__Host-planpilot-session")?.value;return token?verifyFirebase(token):null;}
export async function authGuard(){return await firebaseUser()?null:Response.json({error:"Sign in with Google or an email link to continue."},{status:401});}
