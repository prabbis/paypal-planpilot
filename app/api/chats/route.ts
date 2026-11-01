import {firebaseUser} from "@/lib/firebase-auth";
import {db} from "@/lib/checkout-store";
export const dynamic="force-dynamic";
export async function GET(){const user=await firebaseUser();if(!user)return Response.json({error:"Sign in to open your saved chats."},{status:401});try{const result=await db().prepare("SELECT id,title,updated,revision FROM pricing_chats WHERE owner=? ORDER BY updated DESC LIMIT 100").bind(user.userId).all();return Response.json({chats:result.results},{headers:{"Cache-Control":"no-store"}});}catch{return Response.json({error:"Saved chats are temporarily unavailable."},{status:503});}}
