import {db,SITE} from "@/lib/checkout-store";
import {captureStoreOrder,storeError,StoreError,type StoreOrder} from "@/lib/stores";
export const dynamic="force-dynamic";
export async function GET(request:Request){try{const url=new URL(request.url),receipt=url.searchParams.get("receipt")??"";if(!/^[a-f0-9]{64}$/.test(receipt))throw new StoreError("Invalid receipt.");const order=await db().prepare("SELECT * FROM store_orders WHERE receipt=?").bind(receipt).first<StoreOrder>();if(!order||order.paypal!==url.searchParams.get("token"))throw new StoreError("This checkout does not match your order.");await captureStoreOrder(order);return Response.redirect(SITE+"/checkout/store/receipt?receipt="+receipt,303);}catch(e){return storeError(e);}}
