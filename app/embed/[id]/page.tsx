import {project,SITE} from "@/lib/checkout-store";
import {notFound} from "next/navigation";
import Embed from "@/components/public-embed";
export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;const p=await project(id);if(!p)notFound();return <Embed backendUrl={SITE+"/api/embed/"+id}/>;}
