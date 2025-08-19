import { AxiosService } from "@/lib/axios/axios.config";
import { DateHelper } from "./date-helper";

export class ZohoTokenHelper {
  static accessToken: string = "";
  static expiryTime = 0;

  static refreshThreshold = 30 * 1000;

  static async getAccessToken() {
    if (this.accessToken || !this.isExpiringSoon()) return this.accessToken;
    if (!this.accessToken || this.isExpiringSoon()) {
      try {
        const response = await AxiosService.post<{
          access_token: string;
          refresh_token: string;
          scope: string;
          api_domain: string;
          token_type: string;
          expires_in: number;
        }>(
          `token?refresh_token=${process.env.ZOHO_REFRESH_TOKEN}&client_id=${process.env.ZOHO_CLIENT_ID}&client_secret=${process.env.ZOHO_CLIENT_SECRET}&grant_type=refresh_token`,
          {
            baseURL: "https://accounts.zoho.com/oauth/v2/",
          }
        );

        this.accessToken = response.data.access_token;
        this.expiryTime = response.data.expires_in;
      } catch (error) {
        console.log(error);
      }
      return this.accessToken;
    }
    return this.accessToken;
  }

  static isExpiringSoon() {
    const currentDate = DateHelper.getCurrentDate({}) as Date;

    if (!this.expiryTime) return true;
    const currentTime = currentDate.getTime();
    const timeUntilExpiry = this.expiryTime - currentTime;
    return timeUntilExpiry < this.refreshThreshold;
  }
}
