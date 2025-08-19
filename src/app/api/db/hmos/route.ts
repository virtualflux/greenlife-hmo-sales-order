import { NextApiRequest, NextApiResponse } from "next";
import client from "@/db/db.config";
export async function GET(request: NextApiRequest, res: NextApiResponse) {
  try {
    const db = client.db("admin");
    const hmos = await db.collection("movies").find({}).toArray();
    return res.json(hmos);
  } catch (e) {
    console.error(e);
  }
}
