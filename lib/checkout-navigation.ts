import {SITE} from "./checkout-store";
export function checkoutCancelDestination(projectId:string,configured:string|undefined,view:unknown="hosted"){
 const fallback=SITE+(view==="embed"?"/embed/":"/pricing/")+projectId+"?checkout=cancelled";
 if(!configured)return fallback;
 try{const url=new URL(configured);if(url.protocol!=="https:"||url.username||url.password)return fallback;
 // Old automatic destinations pointed at the cards view or workspace home. Keep explicit custom redirects.
 if(url.origin===SITE&&["/","/embed/"+projectId,"/pricing/"+projectId].includes(url.pathname))return fallback;
 return url.href;
 }catch{return fallback;}
}
