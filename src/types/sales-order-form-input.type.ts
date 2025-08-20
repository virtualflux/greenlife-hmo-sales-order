import { Drugs } from "./drugs.type";

export interface SalesOrderFormInput {
  description: string;
  date: Date | string;
  location: string;
  drugs: Drugs[];
  customer: string;
}
