import {db,SITE} from "@/lib/checkout-store";
import {ownedStore,sameOrigin,storeError,StoreError,bucket,storeSchema} from "@/lib/stores";
export const dynamic="force-dynamic";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){try{
  sameOrigin(request);const {store}=await ownedStore((await params).id);
  if(Number(request.headers.get("content-length")??0)>5500000)throw new StoreError("Choose an image under 5 MB.",413);
  const form=await request.formData(),file=form.get("file"),productId=form.get("productId");
  if(!(file instanceof File)||file.size===0||file.size>5000000||typeof productId!=="string")throw new StoreError("Choose a PNG, JPEG or WebP image under 5 MB.");
  const bytes=new Uint8Array(await file.arrayBuffer());
  const png=[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v),jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255,webp=new TextDecoder().decode(bytes.slice(0,4))==="RIFF"&&new TextDecoder().decode(bytes.slice(8,12))==="WEBP";
  const type=png?"image/png":jpeg?"image/jpeg":webp?"image/webp":null;if(!type)throw new StoreError("Use a PNG, JPEG or WebP image.");
  const draft=storeSchema.parse(JSON.parse(store.draft));const product=draft.products.find(p=>p.id===productId);if(!product)throw new StoreError("Save your product before uploading its photo.");
  const asset=crypto.randomUUID(),url=SITE+"/api/stores/"+store.id+"/branding/"+asset;
  await bucket().put("stores/"+store.id+"/branding/"+asset,bytes,{httpMetadata:{contentType:type}});
  product.image=url;
  await db().prepare("UPDATE stores SET draft=? WHERE id=?").bind(JSON.stringify(draft),store.id).run();
  return Response.json({url});
}catch(e){return storeError(e);}}
