(function(global){
 "use strict";
 async function mount(target,options){
  const element=typeof target==="string"?document.querySelector(target):target;
  if(!element)throw new Error("Pricing container not found.");
  const base=new URL(options.backendUrl);
  if(!["https:","http:"].includes(base.protocol))throw new Error("Invalid backend URL.");
  const response=await fetch(new URL(base.href.replace(/\/$/,"")+"/pricing"));
  if(!response.ok)throw new Error("Could not load pricing.");
  const config=await response.json();
  const root=element.shadowRoot||element.attachShadow({mode:"open"});root.replaceChildren();
  const style=document.createElement("style");style.textContent=`:host{display:block;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#17233e;font-size:15px}*{box-sizing:border-box}.plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,270px),1fr));gap:20px;align-items:stretch}article{position:relative;display:flex;flex-direction:column;background:#fff;border:1px solid #e1e5ef;border-radius:18px;padding:32px;box-shadow:0 8px 30px -18px #1b25552b;min-width:0}article:hover{border-color:#b4a7ed}.offer-index{font-size:11px;letter-spacing:.12em;color:#7a8299;margin-bottom:24px}h3{font-size:23px;letter-spacing:-.04em;line-height:1.2;margin:0 0 24px;overflow-wrap:anywhere}.price{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}strong{font-size:42px;font-weight:650;line-height:1.2;letter-spacing:-.06em}.currency{font-size:12px;color:#737d92;font-weight:600}.billing{font-size:13px;line-height:1.6;min-height:42px;color:#707b92;margin:12px 0 24px}.includes{border-top:1px solid #edf0f5;padding-top:24px;font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:650;color:#525e77}ul{list-style:none;margin:16px 0 28px;padding:0;display:grid;gap:14px}li{position:relative;padding-left:24px;font-size:14px;line-height:1.55;overflow-wrap:anywhere}li:before{content:"✓";position:absolute;left:0;color:#6555d8;font-weight:700}button,a{display:block;text-align:center;background:#635bdf;color:white;border:0;border-radius:8px;padding:14px 18px;font-size:14px;font-weight:600;line-height:1.3;cursor:pointer;text-decoration:none;width:100%;margin-top:auto}button:hover,a:hover{background:#5147cd}button:focus-visible,a:focus-visible{outline:3px solid #bcb5fb;outline-offset:3px}button:disabled{opacity:.55;cursor:wait}.status{font-size:12px;line-height:1.6;color:#68758c;overflow-wrap:anywhere;margin:12px 0 0}.status:empty{display:none}.information{margin-top:auto;padding:14px;background:#f7f8fc;color:#68758c;font-size:12px;border-radius:8px;text-align:center}@media(max-width:500px){article{padding:24px}strong{font-size:36px}}`;root.append(style);
  const grid=document.createElement("div");grid.className="plans";root.append(grid);
  for(const [index,plan] of config.plans.entries()){
   const card=document.createElement("article"),heading=document.createElement("h3"),price=document.createElement("strong"),billing=document.createElement("p"),list=document.createElement("ul"),button=document.createElement("button"),status=document.createElement("p");
   const number=document.createElement("span"),priceRow=document.createElement("div"),currency=document.createElement("span"),includes=document.createElement("div");number.className="offer-index";number.textContent="OFFER "+String(index+1).padStart(2,"0");priceRow.className="price";currency.className="currency";currency.textContent="CAD";billing.className="billing";includes.className="includes";includes.textContent="What’s included";
   heading.textContent=plan.name;price.textContent=new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD"}).format(plan.monthlyPrice);
   billing.textContent=config.billing==="one_time"?"per "+config.priceUnit+" · one-time payment":config.annual?"per month · "+new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD"}).format(plan.billingAmount)+" billed annually":"per month · billed monthly";
   for(const feature of [...(config.showParticipants?[plan.seats+" "+(config.billing==="one_time"?"participants":"included users")]:[]),...(config.showUsage?[plan.units+" "+config.unit+(config.billing==="one_time"?" included":" / month")]:[]),...plan.features]){const li=document.createElement("li");li.textContent=feature;list.append(li);}
   status.className="status";status.setAttribute("role","status");button.textContent=config.billing==="one_time"?"Pay once · PayPal sandbox":"Subscribe · PayPal sandbox";
   button.onclick=async()=>{button.disabled=true;status.textContent="Preparing secure PayPal checkout…";try{
    const r=await fetch(new URL(base.href.replace(/\/$/,"")+"/checkout"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({planKey:plan.key})});
    const data=await r.json();if(!r.ok)throw new Error(data.error||"Checkout failed.");
    const approval=new URL(data.approvalUrl);if(approval.hostname!=="www.sandbox.paypal.com"||approval.protocol!=="https:")throw new Error("Unexpected checkout destination.");
    if(global.top===global){global.location.assign(approval.href);}else{const link=document.createElement("a");link.href=approval.href;link.target="_top";link.textContent="Continue to PayPal";button.replaceWith(link);status.textContent="Continue to PayPal to approve this sandbox checkout.";}
   }catch(e){status.textContent=e.message;button.disabled=false;}};
   priceRow.append(price,currency);card.append(number,heading,priceRow,billing,includes,list);if(!config.pricingOnly){button.textContent=config.billing==="one_time"?"Choose this offer →":"Choose this plan →";card.append(button,status);}else{const information=document.createElement("div");information.className="information";information.textContent="Pricing information · Checkout not enabled";card.append(information);}grid.append(card);
  }
  return {unmount:()=>root.replaceChildren()};
 }
 global.PlanPilot={mount};
})(window);
