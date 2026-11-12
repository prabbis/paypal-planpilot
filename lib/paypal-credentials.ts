export function paypalCredentialErrors(clientId:string,clientSecret:string){
 const id=clientId.trim(),secret=clientSecret.trim();
 return {
  clientId:!id?"Paste the Client ID from your PayPal sandbox app.":id.includes("@")?"This looks like a sandbox account email. Open Apps & Credentials → Sandbox, select your app, and copy its Client ID instead.":id.length<10||id.length>300?"Paste the complete Client ID from your sandbox app.":"",
  clientSecret:!secret?"Paste the Client Secret from the same sandbox app. This is not your account password.":secret.length<10||secret.length>300?"Paste the complete app Client Secret. This is not your sandbox account password.":""
 };
}
