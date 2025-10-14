import { NextRequest } from "next/server";
import client from "@/db/db.config";
import { HttpStatusCode } from "axios";
import * as mongo from "mongodb";
export async function GET(request: NextRequest) {
  try {
    const db = client.db("greenlife");
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

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const deleteIds = body.deleteIds;
  // console.log(deleteIds);
  try {
    const db = client.db("greenlife");
    await db
      .collection("hmos")
      .deleteMany({ zohoInventoryCustomerId: { $in: deleteIds } });
    return Response.json({ message: "Delete successful" });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Internal Server error,HMOS were not deleted." },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
