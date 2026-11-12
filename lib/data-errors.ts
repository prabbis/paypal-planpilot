// Never log raw provider bodies, request contents or credential parsing errors.
export function reportDataError(operation:string,error:unknown){
 const message=error instanceof Error?error.message:"";
 const code=message==="Firebase server credentials are not configured."?"FIREBASE_CREDENTIALS_MISSING":
 message==="Firebase server credentials are incomplete."?"FIREBASE_CREDENTIALS_INVALID":
 message==="Firebase server and web app project IDs must match."?"FIREBASE_PROJECT_MISMATCH":
 error instanceof SyntaxError?"FIREBASE_OR_DATA_JSON_INVALID":
 message.startsWith("Firebase server authentication failed")?"FIREBASE_AUTH_FAILED":
 message.includes("PERMISSION_DENIED")?"FIRESTORE_PERMISSION_DENIED":
 message.includes("FAILED_PRECONDITION")?"FIRESTORE_SETUP_REQUIRED":
 message.includes("NOT_FOUND")?"FIRESTORE_DATABASE_NOT_FOUND":
 message.includes("UNAUTHENTICATED")?"FIREBASE_AUTH_FAILED":
 message.includes("INVALID_ARGUMENT")?"FIRESTORE_INVALID_QUERY":
 message==="Checkout storage is unavailable."?"DATA_BACKEND_NOT_CONFIGURED":"DATA_OPERATION_FAILED";
 const reference=crypto.randomUUID();
 console.error("PlanPilot data operation failed",{operation,code,reference,...(typeof (error as {status?:unknown})?.status==="number"?{status:(error as {status:number}).status}:{})});
 const hint=code==="FIREBASE_CREDENTIALS_MISSING"?"Firebase server credentials are missing from the running service. Add FIREBASE_SERVICE_ACCOUNT_JSON in Render and redeploy.":
 code==="FIREBASE_CREDENTIALS_INVALID"||code==="FIREBASE_OR_DATA_JSON_INVALID"?"Check that FIREBASE_SERVICE_ACCOUNT_JSON contains the complete, valid service-account JSON.":
 code==="FIREBASE_PROJECT_MISMATCH"?"The Firebase service account and FIREBASE_PROJECT_ID must use the same project.":
 code==="FIREBASE_AUTH_FAILED"?"Firebase server authentication failed. Check the service-account credentials.":
 code==="FIRESTORE_PERMISSION_DENIED"?"Firestore access was denied. Check the service account’s permissions and that the Firestore API is enabled.":
 code==="FIRESTORE_SETUP_REQUIRED"?"Firestore needs database or index setup. Check the Firebase configuration guide.":
 code==="FIRESTORE_DATABASE_NOT_FOUND"?"Create the default Firestore database in the configured Firebase project.":
 code==="DATA_BACKEND_NOT_CONFIGURED"?"Set DATA_BACKEND=firebase in Render and redeploy.":"Please retry. The server logged a diagnostic reference.";
 return {code,reference,hint};
}
