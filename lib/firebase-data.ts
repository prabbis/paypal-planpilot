import {env} from "@/lib/runtime-env";
import {firebaseAccount,googleRequest} from "./firebase-server";
import {createDocumentDatabase,type DocumentDriver,type DocumentTransaction,type Filter,type Row,type Sort} from "./document-database";
type Value={stringValue?:string;integerValue?:string;doubleValue?:number;nullValue?:null;booleanValue?:boolean};
type Document={name:string;fields:Record<string,Value>};
const pack=(value:unknown):Value=>value==null?{nullValue:null}:typeof value==="number"?(Number.isInteger(value)?{integerValue:String(value)}:{doubleValue:value}):typeof value==="boolean"?{booleanValue:value}:{stringValue:String(value)};
const unpack=(doc:Document):Row=>Object.fromEntries(Object.entries(doc.fields??{}).map(([key,v])=>[key,v.stringValue??(v.integerValue!==undefined?Number(v.integerValue):v.doubleValue??(v.booleanValue!==undefined?Number(v.booleanValue):null))]));
export class FirestoreRequestError extends Error{constructor(public status:number,message:string){super(message);}}
export class FirestoreDriver implements DocumentDriver{
 constructor(private projectId:string,private prefix="planpilot_",private request:typeof googleRequest=googleRequest){if(!/^[a-zA-Z0-9_-]+$/.test(prefix))throw new Error("Invalid Firestore collection prefix.");}
 private base(){return "https://firestore.googleapis.com/v1/projects/"+encodeURIComponent(this.projectId)+"/databases/(default)/documents";}
 private name(table:string,id:string){if(!/^[a-z_]+$/.test(table)||!id)throw new Error("Invalid document path.");return "projects/"+this.projectId+"/databases/(default)/documents/"+this.prefix+table+"/"+btoa(String.fromCharCode(...new TextEncoder().encode(id))).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");}
 private async json(url:string,options:RequestInit={},notFound=false){const response=await this.request(url,options);if(notFound&&response.status===404)return null;const data=await response.json() as {error?:{status?:string}};if(!response.ok){const hint=data.error?.status==="FAILED_PRECONDITION"?" Check Firestore indexes and database setup.":"";throw new FirestoreRequestError(response.status,"Firestore request failed ("+(data.error?.status??response.status)+")."+hint);}return data;}
 private tx(transaction?:string){const writes:Record<string,unknown>[]=[];const tx:DocumentTransaction={
 get:async(table,id)=>{const name=this.name(table,id);const url="https://firestore.googleapis.com/v1/"+name+(transaction?"?transaction="+encodeURIComponent(transaction):"");const doc=await this.json(url,{},true);return doc?unpack(doc as unknown as Document):null;},
 query:async(table,filters,order,limit)=>{
  const large=filters.find(f=>f.op==="IN"&&Array.isArray(f.value)&&f.value.length>30);
  if(large){const result:Row[]=[];for(let i=0;i<(large.value as unknown[]).length;i+=30)result.push(...await tx.query(table,filters.map(f=>f===large?{...f,value:(large.value as unknown[]).slice(i,i+30)}:f),order));return result;}
  const operators:Record<string,string>={"=":"EQUAL","<>":"NOT_EQUAL","!=":"NOT_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL","IN":"IN"};
  const clauses=filters.map(f=>f.op.toUpperCase().startsWith("IS ")?{unaryFilter:{field:{fieldPath:f.field},op:f.op.toUpperCase()==="IS NULL"?"IS_NULL":"IS_NOT_NULL"}}:{fieldFilter:{field:{fieldPath:f.field},op:operators[f.op.toUpperCase()],value:f.op==="IN"?{arrayValue:{values:(f.value as unknown[]).map(pack)}}:pack(f.value)}});
  const structuredQuery={from:[{collectionId:this.prefix+table}],...(clauses.length?{where:clauses.length===1?clauses[0]:{compositeFilter:{op:"AND",filters:clauses}}}:{}),...(order.length?{orderBy:order.map(o=>({field:{fieldPath:o.field},direction:o.desc?"DESCENDING":"ASCENDING"}))}:{}),...(limit!==undefined?{limit}:{})};
  const data=await this.json(this.base()+":runQuery",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({structuredQuery,...(transaction?{transaction}:{})})}) as unknown as {document?:Document}[];
  return data.filter(v=>v.document).map(v=>unpack(v.document!));
 },
 write:(table,id,row)=>{if(!transaction)throw new Error("Cannot write in a read-only operation.");const name=this.name(table,id);if(row){const fields=Object.fromEntries(Object.entries(row).map(([key,value])=>[key,pack(value)]));if(new TextEncoder().encode(JSON.stringify(fields)).length>900000)throw new Error("This saved record is too large for Firestore. Start a new conversation; your existing record is unchanged.");writes.push({update:{name,fields}});}else writes.push({delete:name});}
 };return{tx,writes};}
 async read<T>(work:(tx:DocumentTransaction)=>Promise<T>){return work(this.tx().tx);}
 async transaction<T>(work:(tx:DocumentTransaction)=>Promise<T>):Promise<T>{for(let attempt=0;attempt<5;attempt++){
  const begun=await this.json(this.base()+":beginTransaction",{method:"POST",headers:{"Content-Type":"application/json"},body:'{"options":{"readWrite":{}}}'}) as unknown as {transaction:string};const {tx,writes}=this.tx(begun.transaction);
  try{const result=await work(tx);if(writes.length>450)throw new Error("Too many records in one data operation. No changes were applied.");await this.json(this.base()+":commit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({transaction:begun.transaction,writes})});return result;}
  catch(error){await this.request(this.base()+":rollback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({transaction:begun.transaction})}).catch(()=>{});if(error instanceof FirestoreRequestError&&error.status===409&&attempt<4){await new Promise(resolve=>setTimeout(resolve,25*(attempt+1)));continue;}throw error;}
 }throw new Error("Data changed repeatedly; please retry.");}
}
let singleton:ReturnType<typeof createDocumentDatabase>|undefined;
export function firebaseDatabase(){return singleton??=createDocumentDatabase(new FirestoreDriver(firebaseAccount().project_id,String((env as Record<string,unknown>).FIRESTORE_COLLECTION_PREFIX||"planpilot_")));}
