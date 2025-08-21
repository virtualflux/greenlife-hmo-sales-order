import { Readable } from "stream";
import csvParser from "csv-parser";
import clientPromise from "@/db/db.config";
import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";
import * as mongo from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const customerId = formData.get("customerId") as string;
    const hmoName = formData.get("hmoName") as string;

    console.log(11, formData);

    if (!file) {
      return Response.json(
        { message: "No file uploaded" },
        { status: HttpStatusCode.BadRequest }
      );
    }

    if (!file.name.endsWith(".csv")) {
      return Response.json(
        { message: "Only CSV files are allowed" },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const nodeStream = Readable.fromWeb(file.stream() as any);

    const rows: any[] = [];
    await new Promise<void>((resolve, reject) => {
      nodeStream
        .pipe(csvParser())
        .on("data", (row) => rows.push(row))
        .on("end", () => resolve())
        .on("error", (err) => reject(err));
    });

    if (rows.length === 0) {
      return Response.json(
        { message: "CSV is empty" },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const client = await clientPromise;
    const db = client.db("greenlife");

    let hmo = await db
      .collection("hmos")
      .findOne({ zohoInventoryCustomerId: customerId });

    if (!hmo) {
      const newHmo = {
        zohoInventoryCustomerId: customerId,
        providerName: hmoName || "Unnamed HMO",
        createdAt: new Date(),
      };

      const insertResult = await db.collection("hmos").insertOne(newHmo);
      hmo = { ...newHmo, _id: insertResult.insertedId };
    }

    const preparedProcedures = rows.map((row) => ({
      ...row,
      hmo: new mongo.ObjectId(hmo._id),
      createdAt: new Date(),
    }));

    await db.collection("procedures").deleteMany({
      hmo: new mongo.ObjectId(hmo._id),
    });

    await db.collection("procedures").insertMany(preparedProcedures);

    return Response.json({
      message: "CSV uploaded successfully",
      rows,
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      { message: "Upload failed" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
