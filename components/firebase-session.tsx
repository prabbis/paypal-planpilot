"use client";
import {useEffect} from "react";
import {getApps,initializeApp,type FirebaseOptions} from "firebase/app";
import {getAuth,onIdTokenChanged} from "firebase/auth";
export default function FirebaseSession({signedIn}:{signedIn:boolean}){useEffect(()=>{let unsubscribe=()=>{};fetch("/api/auth/config").then(async r=>{if(!r.ok)return;const config=await r.json() as FirebaseOptions;const a=getAuth(getApps()[0]??initializeApp(config));unsubscribe=onIdTokenChanged(a,async user=>{if(user){const response=await fetch("/api/auth/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:await user.getIdToken()})});if(response.ok&&!signedIn)window.location.reload();}});});return()=>unsubscribe();},[signedIn]);return null;}
