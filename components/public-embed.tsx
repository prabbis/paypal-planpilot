"use client";
import {useEffect,useRef,useState} from "react";
export default function Embed({backendUrl,hosted=false}:{backendUrl:string;hosted?:boolean}){
 const ref=useRef<HTMLDivElement>(null);const[error,setError]=useState(""),[cancelled,setCancelled]=useState(false),[loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;setCancelled(new URLSearchParams(location.search).get("checkout")==="cancelled");const script=document.createElement("script");script.src="/planpilot-sdk.js";script.onload=()=>{const sdk=(window as unknown as {PlanPilot:{mount:(target:HTMLElement,options:{backendUrl:string})=>Promise<unknown>}}).PlanPilot;if(ref.current)sdk.mount(ref.current,{backendUrl}).then(()=>{if(active)setLoading(false);}).catch(()=>{if(active){setError("Could not load pricing. Please refresh.");setLoading(false);}});};script.onerror=()=>{if(active){setError("Could not load pricing. Please refresh.");setLoading(false);}};document.head.appendChild(script);return()=>{active=false;script.remove();};},[backendUrl]);
 return <div className={hosted?"hosted-cards":"pricing-embed"}>{cancelled&&<p className="embed-feedback" role="status">Checkout cancelled. No payment has been confirmed.</p>}{loading&&<p className="embed-feedback" role="status">Loading pricing…</p>}<div ref={ref}/>{error&&<p className="embed-feedback" role="alert">{error}</p>}</div>;
}
