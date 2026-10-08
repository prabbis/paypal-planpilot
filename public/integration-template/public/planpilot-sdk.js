(function(global){
 "use strict";
 async function mount(target,options){
  const element=typeof target==="string"?document.querySelector(target):target;
  if(!element)throw new Error("Pricing container not found.");
  const base=new URL(options.backendUrl);
  if(!["https:","http:"].includes(base.protocol))throw new Error("Invalid backend URL.");
  const response=await fetch(new URL("/api/pricing",base));
  if(!response.ok)throw new Error("Could not load pricing.");
  const config=await response.json();
  const root=element.shadowRoot||element.attachShadow({mode:"open"});root.replaceChildren();
  const style=document.createElement("style");style.textContent=":host{display:block;font-family:Arial,sans-serif;color:#17243b}.plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}article{background:white;border:1px solid #dfe5ee;border-radius:12px;padding:24px}h3{margin:0 0 15px}strong{font-size:30px}p,li{line-height:1.6;font-size:14px}button,a{display:block;background:#2455dd;color:white;border:0;border-radius:7px;padding:12px;cursor:pointer;text-decoration:none}button:disabled{opacity:.5}.status{font-size:13px;line-height:1.6}";root.append(style);
  const grid=document.createElement("div");grid.className="plans";root.append(grid);
  for(const plan of config.plans){
   const card=document.createElement("article"),heading=document.createElement("h3"),price=document.createElement("strong"),billing=document.createElement("p"),list=document.createElement("ul"),button=document.createElement("button"),status=document.createElement("p");
   heading.textContent=plan.name;price.textContent=new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD"}).format(plan.monthlyPrice);
   billing.textContent=config.annual?"per month · "+new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD"}).format(plan.billingAmount)+" billed annually":"per month · billed monthly";
   for(const feature of [plan.seats+" included users",plan.units+" "+config.unit+" / month",...plan.features]){const li=document.createElement("li");li.textContent=feature;list.append(li);}
   status.className="status";status.setAttribute("role","status");button.textContent="Subscribe · PayPal sandbox";
   button.onclick=async()=>{button.disabled=true;status.textContent="Preparing secure PayPal checkout…";try{
    const r=await fetch(new URL("/api/checkout",base),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({planKey:plan.key})});
    const data=await r.json();if(!r.ok)throw new Error(data.error||"Checkout failed.");
    const approval=new URL(data.approvalUrl);if(approval.hostname!=="www.sandbox.paypal.com"||approval.protocol!=="https:")throw new Error("Unexpected checkout destination.");
    if(global.top===global){global.location.assign(approval.href);}else{const link=document.createElement("a");link.href=approval.href;link.target="_top";link.textContent="Continue to PayPal";button.replaceWith(link);status.textContent="Continue to PayPal. After activation, you’ll return to the app.";}
   }catch(e){status.textContent=e.message;button.disabled=false;}};
   card.append(heading,price,billing,list,button,status);grid.append(card);
  }
  return {unmount:()=>root.replaceChildren()};
 }
 global.PlanPilot={mount};
})(window);
