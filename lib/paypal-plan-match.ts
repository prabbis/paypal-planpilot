type RemotePlan={status?:string;name?:string;billing_cycles?:{tenure_type?:string;pricing_scheme?:{fixed_price?:{value?:string;currency_code?:string}};frequency?:{interval_unit?:string;interval_count?:number}}[]};
function cents(value:unknown){if(typeof value!=="string"||!/^\d+(?:\.\d{1,2})?$/.test(value))return null;return Math.round(Number(value)*100);}
export function paypalPlanMatches(remote:RemotePlan,expected:{name:string;amount:string;annual:boolean}){
 const cycle=remote.billing_cycles?.find(c=>c.tenure_type==="REGULAR"),price=cycle?.pricing_scheme?.fixed_price;
 return remote.status==="ACTIVE"&&remote.name===expected.name&&price?.currency_code==="CAD"&&cents(price.value)!==null&&cents(price.value)===cents(expected.amount)&&cycle?.frequency?.interval_unit===(expected.annual?"YEAR":"MONTH")&&cycle.frequency.interval_count===1;
}
