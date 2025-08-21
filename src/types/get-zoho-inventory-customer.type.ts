export interface ZohoInventoryCustomer {
  code: number;
  message: string;
  contacts: Contact[];
}

export interface Contact {
  contact_id: number;
  contact_name: string;
  company_name: string;
  contact_type: string;
  status: string;
  payment_terms: number;
  payment_terms_label: string;
  currency_id: number;
  currency_code: string;
  outstanding_receivable_amount: number;
  unused_credits_receivable_amount: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  mobile: string;
  created_time: Date;
  last_modified_time: Date;
}
