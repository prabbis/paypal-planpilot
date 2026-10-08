import {env} from "cloudflare:workers";
export function db(){const database=(env as unknown as {DB?:D1Database}).DB;if(!database)throw new Error("Checkout storage is unavailable.");return database;}
export async function limited(key:string,max:number){const row=await db().prepare("INSERT INTO limits (key,count) VALUES (?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count").bind(key).first<{count:number}>();return !row||row.count>max;}
export type PublishedPlan={key:string;name:string;price:number;seats:number;units:number;features:string[];planId:string;amount:string};
export type Config={title:string;unit:string;annual:boolean;website:string;success:string;cancel:string;webhook:string;plans:PublishedPlan[]};
export type Project={id:string;owner:string;config:string;secret:string;created:number};
export type Session={id:string;project:string;plan:string;reference:string;subscription:string|null;status:string;created:number};
export async function project(id:string){if(!/^[a-f0-9-]{36}$/.test(id))return null;return db().prepare("SELECT * FROM projects WHERE id=?").bind(id).first<Project>();}
export async function setting(key:string){return (await db().prepare("SELECT value FROM settings WHERE key=?").bind(key).first<{value:string}>())?.value;}
export function publicUrl(value:string){const u=new URL(value);if(u.protocol!=="https:"||u.username||u.password||u.port||u.hostname.endsWith(".")||!u.hostname.includes(".")||/^[\d.]+$/.test(u.hostname)||/[\[\]:]/.test(u.hostname)||/(^|\.)(localhost|local|internal|test|invalid)$/.test(u.hostname))throw new Error("Use a public HTTPS URL.");return u;}
export async function publicEndpoint(value:string){const u=publicUrl(value);let resolved=false; // Reject private DNS destinations before any callback request.
 for(const type of ["A","AAAA"]){const r=await fetch("https://cloudflare-dns.com/dns-query?"+new URLSearchParams({name:u.hostname,type}),{headers:{accept:"application/dns-json"},signal:AbortSignal.timeout(5000)});if(!r.ok)throw new Error("Could not validate webhook hostname.");const data=await r.json() as {Answer?:{type:number;data:string}[]};for(const a of data.Answer??[]){if(a.type===1){resolved=true;const oct=a.data.split(".").map(Number);if(oct[0]===0||oct[0]===10||oct[0]===127||oct[0]>=224||oct[0]===169&&oct[1]===254||oct[0]===172&&oct[1]>=16&&oct[1]<=31||oct[0]===192&&oct[1]===168||oct[0]===100&&oct[1]>=64&&oct[1]<=127)throw new Error("Webhook hostname must resolve publicly.");}if(a.type===28){resolved=true;if(!/^[23][0-9a-f]{3}:/i.test(a.data)||a.data.includes("."))throw new Error("Webhook hostname must resolve publicly.");}}}
 if(!resolved)throw new Error("Webhook hostname could not be resolved.");
 return u;
}
export const SITE="https://planpilot-prabbis-demo.abisolaadeniran.chatgpt.site";
export function failure(error:unknown){console.error("Checkout request failed",error instanceof Error?error.message:"unknown");return Response.json({error:"Checkout could not complete. Check your configuration and retry."},{status:503,headers:{"Cache-Control":"no-store"}});}
