import {firebaseConfig} from "@/lib/firebase-auth";
export const dynamic="force-dynamic";
export async function GET(){const config=firebaseConfig();if(Object.values(config).some(v=>!v))return Response.json({error:"Firebase web configuration is incomplete."},{status:503});return Response.json(config,{headers:{"Cache-Control":"no-store"}});}
