import client from "@/db/db.config";
import { HttpStatusCode } from "axios";
import { NextRequest } from "next/server";
import * as mongo from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const searchQuery = request.nextUrl.searchParams;
    const customer = searchQuery.get("customer");
    console.log({ customer });
    const db = client.db("greenlife");
    if (customer) {
      const procedures = await db
        .collection("procedures")
        .find({
          hmo: new mongo.ObjectId(customer),
        })
        .toArray();

      return Response.json(procedures);
    } else {
      return Response.json(
        { message: "Bad request, customer was not provided" },
        { status: HttpStatusCode.BadRequest }
      );
    }
  } catch (e) {
    console.error(e);
    return Response.json(
      { message: "Internal Server error, customer was not fetched" },
      { status: HttpStatusCode.BadRequest }
    );
  }
}
