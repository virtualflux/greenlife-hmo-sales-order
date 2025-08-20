import { AxiosService } from "@/lib/axios/axios.config";
import { ZohoTokenHelper } from "@/utils/zoho-token-helper";
import axios, { HttpStatusCode } from "axios";
import { NextRequest } from "next/server";

export async function Post(request: NextRequest) {
  try {
    const accessToken = await ZohoTokenHelper.getAccessToken();
    if (!request.body) {
      return Response.json(
        { message: "Bad request: Body was not provided" },
        { status: HttpStatusCode.BadRequest }
      );
    }
    const data = await AxiosService.post(
      `locations?organization_id=${process.env.ZOHO_ORG_ID}`,
      request.body,
      { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } }
    );
    // console.log({ data: JSON.stringify(data.data, null, 2) });
    return Response.json(
      {
        message: "Sales order created successfully",
        saleOrder: [],
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (error: any) {
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
      { message: error?.message || "Internal server error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
