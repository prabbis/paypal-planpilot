"use client";
import {useMemo,useState} from "react";
import {AgGridReact} from "ag-grid-react";
import {AllCommunityModule,ModuleRegistry,themeQuartz,type ColDef} from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);
type Plan={name:string;price:number;seats:number;units:number;features:string[]};
type Row=Plan&{id:string;featureText:string};
export function PricingGrid({plans,unit,disabled,onChange,recurring=true,priceUnit="offer",showParticipants=true}:{recurring?:boolean;priceUnit?:string;showParticipants?:boolean;plans:Plan[];unit:string;disabled:boolean;onChange:(plans:Plan[])=>void}){
 const[error,setError]=useState("");
 const rows=useMemo(()=>plans.map((p,i)=>({...p,id:String(i),featureText:p.features.join("\n")})),[plans]);
 const columns=useMemo<ColDef<Row>[]>(()=>[
  {field:"name",headerName:"Plan",minWidth:140,cellEditorParams:{maxLength:30}},
  {field:"price",headerName:recurring?"Monthly price (CAD)":"Price per "+priceUnit+" (CAD)",minWidth:180,cellEditor:"agNumberCellEditor",cellEditorParams:{min:1,max:100000,precision:2}},
  {field:"seats",headerName:"Included users",minWidth:150,cellEditor:"agNumberCellEditor",cellEditorParams:{min:1,max:10000,precision:0}},
  {field:"units",headerName:unit+(recurring?" / month":" for costing"),minWidth:180,cellEditor:"agNumberCellEditor",cellEditorParams:{min:1,max:1000000,precision:0}},
  {field:"featureText",headerName:"Features (one per line)",minWidth:260,cellEditor:"agLargeTextCellEditor",cellEditorPopup:true,wrapText:true,autoHeight:true,cellEditorParams:{maxLength:2400,rows:10,cols:40}}
 ].filter(c=>showParticipants||c.field!=="seats") as ColDef<Row>[],[unit,recurring,priceUnit,showParticipants]);
 return <div className="grid-editor"><h3>Edit your pricing table</h3><p>Click a cell to edit. Press Enter to save or Escape to cancel. Cards and cost estimates update immediately.</p>
 <div style={{height:330,width:"100%"}}><AgGridReact<Row> theme={themeQuartz} rowData={rows} columnDefs={columns} defaultColDef={{flex:1,editable:!disabled,resizable:true}} getRowId={p=>p.data.id} readOnlyEdit singleClickEdit stopEditingWhenCellsLoseFocus onCellEditRequest={e=>{
  const field=e.colDef.field;if(!field)return;
  const candidate={...e.data,[field]:e.newValue};
  const features=String(candidate.featureText).split("\n").map(f=>f.trim()).filter(Boolean);
  if(!candidate.name.trim()||candidate.name.length>30||!Number.isFinite(candidate.price)||candidate.price<1||candidate.price>100000||!Number.isInteger(candidate.seats)||candidate.seats<1||candidate.seats>10000||!Number.isInteger(candidate.units)||candidate.units<1||candidate.units>1000000||features.length<1||features.length>12||features.some(f=>f.length>200)){setError("Use a valid name, positive price, whole-number limits and 1–12 features of up to 200 characters.");return;}
  setError("");onChange(plans.map((p,i)=>String(i)===candidate.id?{...p,name:candidate.name.trim(),price:candidate.price,seats:candidate.seats,units:candidate.units,features}:p));
 }}/></div>{error&&<p role="alert" className="warning-note">{error}</p>}<p className="fine-print">Edits change this draft. Existing PayPal billing plans stay unchanged; create new plans before exporting checkout for revised pricing.</p></div>;
}
