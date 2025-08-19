import axios, {
  Axios,
  AxiosRequestConfig,
  AxiosResponse,
  HttpStatusCode,
} from "axios";

// class AppAxiosInstance {
//   instance: Axios | null;
//   isServer = typeof window === "undefined";
//   constructor(configOptions: AxiosRequestConfig) {
//     this.instance = axios.create(configOptions);
//   }

//   private loggerInterceptor() {}
// }

// const app = new AppAxiosInstance({
//   baseURL: "https://www.zohoapis.com/inventory/v1/",
// });

const isServer = typeof window === "undefined";

const logInterceptor = async (req: any) => {
  if (isServer) {
    console.log("[AXIOS] [SERVER] ", req.url);
  } else {
    console.log("[AXIOS] [CLIENT] ", req.url);
  }
  return req;
};

const errorInterceptor = async (res: AxiosResponse<any>) => {
  if (res.status == HttpStatusCode.BadRequest) {
    console.log({ message: "BAD REQUEST", status: res.status });
  } else if (res.status == HttpStatusCode.Unauthorized) {
    console.log({ message: "UNAUTHORIZED", status: res.status });
  } else {
    console.log({ message: "INTERNAL SERVER ERROR" });
  }
  return res;
};

const baseUrl = "https://www.zohoapis.com/inventory/v1/";
export const AxiosService = axios.create({
  baseURL: baseUrl,
});

AxiosService.interceptors.request.use(logInterceptor);

AxiosService.interceptors.response.use(errorInterceptor);
