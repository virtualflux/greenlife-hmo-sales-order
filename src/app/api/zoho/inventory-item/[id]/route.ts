import { AxiosService } from "@/lib/axios/axios.config";
import { InventoryItems, Item } from "@/types/zoho-inventory-item.type";
import { ZohoTokenHelper } from "@/utils/helper/zoho-token-helper";
import axios, { HttpStatusCode } from "axios";
import { NextRequest } from "next/server";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessToken = await ZohoTokenHelper.getAccessToken();
    const id = (await params).id;
    console.log({ accessToken });
    const data = await AxiosService.get<{ item: Item }>(
      `items/${id}?organization_id=${process.env.ZOHO_ORG_ID}`,
      { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } }
    );
    // console.log({ data: JSON.stringify(data.data, null, 2) });
    return Response.json(
      {
        message: "Drug Item fetched successfully",
        item: data.data.item,
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // This is definitely an Axios error
      console.log("Axios error:", error.response?.data);
      console.log("Status code:", error.response?.status);
      console.log("Error message:", error.message);
      return Response.json(
        {
          message:
            error.response?.data?.message ||
            error.message ||
            "Internal server error",
        },
        { status: error.response?.status || 500 }
      );
    }
    return Response.json(
      { message: "Internal server error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
