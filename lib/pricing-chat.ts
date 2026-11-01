import {deliverySchema} from "./service-cost";
import {offeringSchema,defaultOffering} from "./offering";
import {z} from "zod";
const bounded=z.string().max(16000),amount=z.number().finite().min(0).max(10000);
export const chatSnapshotSchema=z.object({awaitingDetails:z.boolean().optional().default(false),offering:offeringSchema.optional().default(defaultOffering),
 messages:z.array(z.object({role:z.enum(["user","assistant"]),text:bounded,sources:z.array(z.object({url:z.string().url().max(2000),title:z.string().max(200)})).max(12).optional()})).min(1).max(500),
 model:z.object({title:z.string().max(127),unit:z.string().max(50),component:z.string().max(80),features:z.array(z.string().max(200)).max(12),unitCost:amount}),
 plans:z.array(z.object({delivery:deliverySchema.nullable().optional().default(null),name:z.string().max(30),price:z.number().finite().min(0).max(100000),seats:z.number().int().min(1).max(10000),units:z.number().int().min(1).max(1000000),features:z.array(z.string().max(200)).max(30)})).max(3),
 description:z.string().max(4000),input:z.string().max(4000),website:z.string().max(2000),websiteMode:z.enum(["suggest","review"]),
 workload:z.object({unitDefinition:z.string().max(1500),workflow:z.string().max(1500),resources:z.string().max(1500),costBasis:z.enum(["estimated","measured"]),typicalUsage:z.number().min(0).max(100),retryPercent:z.number().min(0).max(300),reservePercent:z.number().min(0).max(200),overhead:amount,labourRate:amount.optional().default(0),labourMinutesPerUnit:amount.optional().default(0),participantCost:amount.optional().default(.5)}),
 assessment:z.object({confidence:z.string().max(30),assumptions:z.array(z.string().max(500)).max(8),missing:z.array(z.string().max(500)).max(8),risks:z.array(z.string().max(500)).max(8),guardrails:z.array(z.object({plan:z.string().max(30),rules:z.array(z.string().max(500)).max(8),atLimit:z.string().max(500)})).max(3)}).nullable(),
 base:amount,unitCost:amount,fee:z.number().min(0).max(10),fixed:amount,target:z.number().min(0).max(85),annual:z.boolean(),aiDraft:z.boolean(),reasoning:z.string().max(4000),tab:z.enum(["plans","editor","costs","paypal","embed"]),billingStore:z.union([z.literal(""),z.string().uuid()]),created:z.boolean(),remotePlans:z.array(z.object({id:z.string().max(100),name:z.string().max(127),amount:z.string().max(30),status:z.string().max(30)})).max(3),requestKey:z.string().uuid().nullable()
});
export type ChatSnapshot=z.infer<typeof chatSnapshotSchema>;
export type ChatSummary={id:string;title:string;updated:number;revision:number};
export function chatTitle(s:ChatSnapshot){return (s.aiDraft?s.model.title:s.messages.find(m=>m.role==="user")?.text||s.input||"New pricing chat").replace(/\s+/g," ").slice(0,80);}
