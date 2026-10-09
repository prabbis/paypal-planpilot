import type {Metadata} from "next";
import {slugStore,publicConfig,storeSchema,type StoreConfig} from "@/lib/stores";
import {notFound} from "next/navigation";
import Shop from "@/components/storefront";
export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const store=await slugStore((await params).slug);if(!store?.published)return {title:"Store unavailable",robots:{index:false}};const c=storeSchema.parse(JSON.parse(store.published));return {title:c.name,icons:c.faviconUrl?{icon:c.faviconUrl}:undefined,description:c.description.slice(0,160),openGraph:{title:c.name,description:c.description.slice(0,160),images:c.heroImage?[c.heroImage]:[]},twitter:{title:c.name,description:c.description.slice(0,160),images:c.heroImage?[c.heroImage]:[]}};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const store=await slugStore(slug);if(!store?.published)notFound();return <Shop config={publicConfig(storeSchema.parse(JSON.parse(store.published)))} slug={slug} connected={!!store.credentials}/>;}
