import {db,project,SITE} from "@/lib/checkout-store";
import {notFound} from "next/navigation";
import Embed from "@/components/public-embed";
export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;const p=await project(id);if(!p)notFound();if(p.owner.startsWith("demo:")){const active=await db().prepare("SELECT owner FROM demo_sessions WHERE owner=? AND expires>?").bind(p.owner,Date.now()).first();if(!active)notFound();}return <Embed backendUrl={SITE+"/api/embed/"+id}/>;}
