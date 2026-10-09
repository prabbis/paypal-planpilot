import {db} from "@/lib/checkout-store";
import {ownedStore,storeError} from "@/lib/stores";
export const dynamic="force-dynamic";
export async function GET(_r:Request,{params}:{params:Promise<{id:string}>}){try{const {store}=await ownedStore((await params).id);const data=await db().prepare("SELECT id,email,total,status,shipping,created FROM store_orders WHERE store=? ORDER BY created DESC LIMIT 100").bind(store.id).all();return Response.json({orders:data.results},{headers:{"Cache-Control":"no-store"}});}catch(e){return storeError(e);}}
