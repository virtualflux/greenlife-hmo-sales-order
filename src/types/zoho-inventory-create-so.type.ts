export interface CreateSalesOrder {
  customer_id: number;
  line_items: LineItem[];
  salesorder_number: string;

  // Optional fields
  date?: Date;
  shipment_date?: Date;
  custom_fields?: CustomField[];
  reference_number?: string;
  location_id?: string;
  notes?: string;
  terms?: string;
  discount?: string;
  is_discount_before_tax?: boolean;
  discount_type?: string;
  shipping_charge?: number;
  delivery_method?: string;
  adjustment?: number;
  pricebook_id?: number;
  salesperson_id?: number;
  adjustment_description?: string;
  is_inclusive_tax?: boolean;
  exchange_rate?: number;
  template_id?: number;
  documents?: Document[];
  billing_address_id?: number;
  shipping_address_id?: number;
  place_of_supply?: string;
  gst_treatment?: string;
  gst_no?: string;
}

export interface CustomField {
  custom_field_id: number;
  index: number;
  label: string;
  value: string;
}

export interface Document {
  can_send_in_mail: boolean;
  file_name: string;
  file_type: string;
  file_size_formatted: string;
  attachment_order: number;
  document_id: number;
  file_size: number;
}

export interface LineItem {
  item_id: number;
  name: string;
  description: string;
  rate: number;
  quantity: number;
  unit: string;
  tax_id: number;
  tds_tax_id: string;
  tax_name: string;
  tax_type: string;
  tax_percentage: number;
  item_total: number;
  location_id: string;
  hsn_or_sac: number;
  sat_item_key_code: number;
  unitkey_code: string;
}
