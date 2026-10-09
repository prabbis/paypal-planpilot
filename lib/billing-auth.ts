import {merchantGuard} from "./merchant-auth";
import {accessToken} from "./paypal";
import {ownedStore,storeToken,getStore,StoreError} from "./stores";
import type {Config} from "./checkout-store";
export async function billingToken(storeId?:string){if(storeId){const {store}=await ownedStore(storeId);return storeToken(store);}const denied=await merchantGuard();if(denied)throw new StoreError((await denied.json() as {error:string}).error,denied.status);return accessToken();}
export async function publishedToken(config:Config,owner:string){if(config.storeId){const store=await getStore(config.storeId);if(!store||store.owner!==owner)throw new StoreError("Merchant account unavailable.",409);return storeToken(store);}return accessToken();}
