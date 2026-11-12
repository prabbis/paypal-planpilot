export async function GET(){
 return Response.json({error:"File uploads and downloads are not available in PlanPilot’s pricing workspace."},{status:410});
}
