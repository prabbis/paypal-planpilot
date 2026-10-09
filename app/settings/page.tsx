import {firebaseUser} from "@/lib/firebase-auth";
import {redirect} from "next/navigation";
import AccountSettings from "@/components/account-settings";
export const dynamic="force-dynamic";
export default async function Page(){const user=await firebaseUser();if(!user)redirect("/login?return_to=%2Fsettings");return <AccountSettings user={user}/>;}
