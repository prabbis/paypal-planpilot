import {storeSchema,blankStore,StoreError,type StoreConfig} from "./stores";

const string = (maxLength:number) => ({type:"string",maxLength});
export const storeDraftSchema = {
  type:"object",additionalProperties:false,
  properties:{name:{...string(100),minLength:1},headline:string(160),description:string(3000),about:string(4000),tagline:string(160),accent:{type:"string",pattern:"^#[0-9a-fA-F]{6}$"},background:{type:"string",enum:["light","dark"]},font:{type:"string",enum:["sans","serif"]},layout:{type:"string",enum:["grid","list"]},products:{type:"array",maxItems:8,items:{type:"object",additionalProperties:false,properties:{name:{...string(100),minLength:1},description:string(2000),type:{type:"string",enum:["physical","digital","service"]},price:{type:"number",minimum:0,maximum:100000}},required:["name","description","type","price"]}}},
  required:["name","headline","description","about","tagline","accent","background","font","layout","products"]
};

export function generatedStore(raw:string,existing:StoreConfig=blankStore){
  let generated:Record<string,unknown>;
  try{generated=JSON.parse(raw);}catch{throw new StoreError("AI returned an incomplete draft. Please try again.",502);}
  if(!generated||typeof generated!=="object"||!Array.isArray(generated.products))throw new StoreError("AI did not return a store draft. Please try again.",502);
  // Support shorthand hex colours from older models without dropping the merchant's branding.
  if(typeof generated.accent==="string"&&/^#[0-9a-fA-F]{3}$/.test(generated.accent))generated.accent="#"+generated.accent.slice(1).split("").map(c=>c+c).join("");
  const result=storeSchema.safeParse({...existing,...generated,logoUrl:existing.logoUrl??"",faviconUrl:existing.faviconUrl??"",contactEmail:existing.contactEmail,heroImage:existing.heroImage,products:generated.products.map(p=>({...p,id:crypto.randomUUID(),image:"",enabled:true,fileKey:"",fileName:"",paypalProductId:""}))});
  if(!result.success){console.error("AI store validation failed",result.error.issues.map(i=>({field:i.path.join("."),code:i.code})));throw new StoreError("AI returned a draft that could not be used. Please try again with your store name, products and preferred style.",502);}
  return result.data;
}
