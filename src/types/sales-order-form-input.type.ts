import { Drugs } from "./drugs.type";

export interface SalesOrderFormInput {
  description: string;
  date: Date | string;
  location: string;
  drugs: Drugs[];
  customer: string;
  hmoCustomer: string;
  privateCustomer: string;
  enrolleeName: string;
  enrolleeID: string;
}
