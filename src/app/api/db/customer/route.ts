import { NextRequest } from "next/server";
import client from "@/db/db.config";
import { HttpStatusCode } from "axios";
export async function GET(request: NextRequest) {
  try {
    const db = client.db("admin");
    const hmos = await db.collection("hmos").find({}).toArray();
    // console.log({ hmos: JSON.stringify(hmos, null, 2) });
    return Response.json({ customers: hmos });
  } catch (e) {
    console.error(e);
    return Response.json(
      { message: "Internal Server error, customer was not fetched" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
