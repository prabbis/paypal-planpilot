import {db,type Config,type Project} from "./checkout-store";
export class PublicationError extends Error{constructor(message:string,public status:number){super(message);}}
export function assertSameOffers(previous:Config,next:Config){
 const clean=(c:Config)=>({billing:c.billing??"subscription",annual:c.annual,plans:c.plans.map(p=>({name:p.name,price:p.price,seats:p.seats,units:p.units,features:p.features}))});
 if(JSON.stringify(clean(previous))!==JSON.stringify(clean(next)))throw new PublicationError("This draft differs from the published page. Open its matching conversation, or publish a new pricing page before enabling checkout.",409);
 if(!previous.pricingOnly&&previous.storeId!==next.storeId)throw new PublicationError("This checkout already uses a different PayPal connection. Publish a new checkout for another merchant.",409);
}
export async function saveCheckoutPublication(id:string,owner:string,config:Config,secret:string,previous:Project|null){
 if(previous){if(previous.owner!==owner)throw new PublicationError("Pricing page not found.",404);const old=JSON.parse(previous.config) as Config;assertSameOffers(old,config);config={priceUnit:old.priceUnit,showParticipants:old.showParticipants,showUsage:old.showUsage,...config};if(!old.pricingOnly)secret=previous.secret;const result=await db().prepare("UPDATE projects SET config=?,secret=? WHERE id=? AND owner=? AND config=?").bind(JSON.stringify({...config,pricingOnly:false}),secret,id,owner,previous.config).run();if(!result.meta.changes)throw new PublicationError("This page changed while checkout was being enabled. Refresh and retry.",409);}
 else await db().prepare("INSERT INTO projects (id,owner,config,secret,created) VALUES (?,?,?,?,?)").bind(id,owner,JSON.stringify({...config,pricingOnly:false}),secret,Date.now()).run();
 return secret;
}
