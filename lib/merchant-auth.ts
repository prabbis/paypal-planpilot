import {env} from "cloudflare:workers";
import {firebaseUser} from "./firebase-auth";
export async function merchantUser(){
 const user=await firebaseUser();
 const owner=(env as unknown as Record<string,string>).PAYPAL_OWNER_EMAIL;
 return user&&!user.isDemo&&owner&&user.email.toLowerCase()===owner.toLowerCase()?user:null;
}
export async function merchantGuard(){
 const user=await firebaseUser();
 if(!user)return Response.json({error:"Sign in to manage pricing and checkout."},{status:401});
 if(!await merchantUser())return Response.json({error:"This sandbox workspace is managed by its owner. Public embeds are available without login."},{status:403});
 return null;
}
