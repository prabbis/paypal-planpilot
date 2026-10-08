import "dotenv/config";
import {readFileSync,writeFileSync} from "node:fs";
import {paypal} from "./paypal.mjs";
const config=JSON.parse(readFileSync("./config.json","utf8"));
const url=new URL("/api/paypal/webhook",config.backendUrl);
if(url.protocol!=="https:")throw new Error("Deploy on HTTPS before registering PayPal webhooks.");
const data=await paypal("/v1/notifications/webhooks",{url:url.href,event_types:["BILLING.SUBSCRIPTION.ACTIVATED","BILLING.SUBSCRIPTION.UPDATED","BILLING.SUBSCRIPTION.CANCELLED","BILLING.SUBSCRIPTION.SUSPENDED","BILLING.SUBSCRIPTION.EXPIRED","BILLING.SUBSCRIPTION.PAYMENT.FAILED","PAYMENT.SALE.COMPLETED","PAYMENT.SALE.REFUNDED","PAYMENT.SALE.REVERSED"].map(name=>({name}))});
if(typeof data.id!=="string")throw new Error("Webhook registration failed.");
const existing=readFileSync(".env","utf8");writeFileSync(".env",existing.replace(/^PAYPAL_WEBHOOK_ID=.*$/m,"").trim()+"\nPAYPAL_WEBHOOK_ID="+data.id+"\n",{mode:0o600});console.log("Webhook registered. Restart the server to load its ID.");
