import Home from "@/components/planpilot-app";
import {firebaseUser} from "@/lib/firebase-auth";
import {merchantUser} from "@/lib/merchant-auth";
export const dynamic="force-dynamic";
export default async function Page(){const user=await firebaseUser();return <Home signedIn={!!user} isMerchant={!!await merchantUser()} signInHref="/login" signOutHref="/login"/>;}
