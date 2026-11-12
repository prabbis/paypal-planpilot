import {firebaseUser} from "@/lib/firebase-auth";
import {redirect} from "next/navigation";
import Integrations from "@/components/integration-workspace";
export const dynamic="force-dynamic";
export default async function Page(){const user=await firebaseUser();if(!user)redirect("/login?return_to=%2Fintegrations");return <Integrations isDemo={!!user.isDemo}/>;}
