import {firebaseUser} from "@/lib/firebase-auth";
import {redirect} from "next/navigation";
import Stores from "@/components/store-dashboard";
export const dynamic="force-dynamic";
export default async function Page(){const user=await firebaseUser();if(!user)redirect("/login?return_to=%2Fstores");return <Stores name={user.displayName}/>;}
