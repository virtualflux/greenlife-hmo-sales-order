import { AxiosService } from "@/lib/axios/axios.config";
import { ZohoTokenHelper } from "@/utils/zoho-token-helper";

export async function GET() {
  try {
    const accessToken = await ZohoTokenHelper.getAccessToken();
    const response = await AxiosService.get(
      `https://www.zohoapis.com/inventory/v1/contacts?organization_id=${process.env.ZOHO_ORG_ID}`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      }
    );

    return Response.json(response.data.contacts || []);
  } catch (error: any) {
    console.error(error)
    return Response.json(
      { message: error?.message || "Internal server error" },
      { status: error?.response?.status || 500 }
    );
  }
}