import {reportDataError} from "@/lib/data-errors";
import {cookies} from "next/headers";
import {firebaseUser} from "@/lib/firebase-auth";
import {createDemoSession,revokeDemoSession,DEMO_SECONDS,SESSION_COOKIE} from "@/lib/demo-session";
import {SITE} from "@/lib/checkout-store";
export const dynamic="force-dynamic";
export async function POST(request:Request){
 if(request.headers.get("origin")!==SITE)return Response.json({error:"Request origin is not allowed."},{status:403});
 try{
  // Reuse an active demo. The separate demo cookie preserves the regular sign-in.
  const current=await firebaseUser();if(current?.isDemo)return Response.json({ready:true},{headers:{"Cache-Control":"no-store"}});
  const token=await createDemoSession(request);if(!token)return Response.json({error:"The demo is busy. Try again later, or sign in to use your own workspace."},{status:429});
  (await cookies()).set(SESSION_COOKIE,token,{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:DEMO_SECONDS});
  return Response.json({ready:true},{headers:{"Cache-Control":"no-store"}});
 }catch(error){const diagnostic=reportDataError("demo.start",error);return Response.json({error:"The demo could not start. "+diagnostic.hint+" ["+diagnostic.code+" · "+diagnostic.reference+"]",code:diagnostic.code,reference:diagnostic.reference},{status:503});}
}

export async function DELETE(request:Request){if(request.headers.get("origin")!==SITE)return new Response(null,{status:403});try{const jar=await cookies();const token=jar.get(SESSION_COOKIE)?.value;if(token)await revokeDemoSession(token);jar.set(SESSION_COOKIE,"",{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:0});return Response.json({ended:true},{headers:{"Cache-Control":"no-store"}});}catch{return Response.json({error:"Could not end the demo. Please retry."},{status:503});}}
