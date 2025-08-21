import { AxiosService } from "@/lib/axios/axios.config";
import { ZohoInventoryCustomer } from "@/types/get-zoho-inventory-customer.type";
import { ZohoTokenHelper } from "@/utils/helper/zoho-token-helper";
import axios from "axios";

export async function GET() {
  try {
    const accessToken = await ZohoTokenHelper.getAccessToken();
    const response = await AxiosService.get<ZohoInventoryCustomer>(
      `contacts?organization_id=${process.env.ZOHO_ORG_ID}`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      }
    );

    return Response.json(response.data.contacts);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
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
      { status: error?.response?.status || 500 }
    );
  }
}
