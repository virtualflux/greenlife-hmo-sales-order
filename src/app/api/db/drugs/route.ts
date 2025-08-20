import client from "@/db/db.config";
import { NextRequest } from "next/server";
export async function GET(request: NextRequest) {
  try {
    const searchQuery = request;
    const db = client.db("greenlife");
    const hmos = await db.collection("Procedure").find({}).toArray();
    return Response.json(hmos);
  } catch (e) {
    console.error(e);
  }
}
