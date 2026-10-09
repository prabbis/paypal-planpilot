import {firebaseUser} from "@/lib/firebase-auth";
import {getStore,storeSchema} from "@/lib/stores";
import {redirect,notFound} from "next/navigation";
import Editor from "@/components/store-editor";
export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;const user=await firebaseUser();if(!user)redirect("/login?return_to="+encodeURIComponent("/stores/"+id));const store=await getStore(id);if(!store||store.owner!==user.userId)notFound();return <Editor id={id} initial={storeSchema.parse(JSON.parse(store.draft))} initialSlug={store.slug??""} initialPublished={!!store.published} initialConnected={!!store.credentials}/>;}
