import { AxiosService } from "@/lib/axios/axios.config";
import { ZohoInventoryCustomer } from "@/types/get-zoho-inventory-customer.type";
import { ZohoTokenHelper } from "@/utils/helper/zoho-token-helper";
import axios from "axios";
import { NextRequest } from "next/server";
import client from "@/db/db.config";

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

export async function POST(request: NextRequest) {
  try {
    const db = client.db("greenlife");
    const accessToken = await ZohoTokenHelper.getAccessToken();
    const body = await request.json();
    const customerType = body.customerType;
    const createContactDto = {
      ...body,

      // customer_sub_type: "individual",
      contact_type: "customer",
    };
    delete createContactDto.customerType;

    // console.log({ dto: JSON.stringify(createContactDto, null, 2) });

    const response = await AxiosService.post<ZohoInventoryCustomer>(
      `contacts?organization_id=${process.env.ZOHO_ORG_ID}`,
      createContactDto,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      }
    );
    console.log({ res: JSON.stringify(response.data, null, 2) });

    if (customerType == "hmo") {
      const newHmo = await db.collection("hmos").insertOne({
        providerName: response.data.contact.contact_name,
        zohoInventoryCustomerId: response.data.contact.contact_id,
        createdAt: new Date(),
      });
    }

    return Response.json(response.data.contact);
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