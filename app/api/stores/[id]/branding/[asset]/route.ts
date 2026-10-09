import {SITE} from "@/lib/checkout-store";
import {firebaseUser} from "@/lib/firebase-auth";
import {getStore,bucket,storeError,StoreError} from "@/lib/stores";
export const dynamic="force-dynamic";
export async function GET(_request:Request,{params}:{params:Promise<{id:string;asset:string}>}){try{
  const {id,asset}=await params;if(!/^[a-f0-9-]{36}$/.test(asset))throw new StoreError("Image not found.",404);
  const store=await getStore(id);if(!store)throw new StoreError("Image not found.",404);
  const url=SITE+"/api/stores/"+id+"/branding/"+asset;
  const matches=(raw:string|null)=>{if(!raw)return false;const c=JSON.parse(raw);return c.logoUrl===url||c.faviconUrl===url;};
  const published=matches(store.published);
  if(!published){const user=await firebaseUser();if(user?.userId!==store.owner||!matches(store.draft))throw new StoreError("Image not found.",404);}
  const file=await bucket().get("stores/"+id+"/branding/"+asset);if(!file)throw new StoreError("Image not found.",404);
  return new Response(file.body,{headers:{"Content-Type":file.httpMetadata?.contentType??"image/png","X-Content-Type-Options":"nosniff","Cache-Control":"no-store"}});
}catch(e){return storeError(e);}}
