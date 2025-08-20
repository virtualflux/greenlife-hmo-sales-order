export interface InventoryItems {
  code: number;
  message: string;
  items: Item[];
}

export interface Item {
  group_id: number;
  group_name: string;
  item_id: number;
  name: string;
  status: string;
  source: string;
  is_linked_with_zohocrm: boolean;
  item_type: string;
  description: string;
  rate: number;
  is_taxable: boolean;
  tax_id: number;
  tax_name: string;
  tax_percentage: number;
  purchase_description: string;
  purchase_rate: number;
  is_combo_product: boolean;
  product_type: string;
  attribute_id1: number;
  attribute_name1: string;
  reorder_level: number;
  locations: Location[];
  sku: string;
  upc: number;
  ean: number;
  isbn: number;
  part_number: number;
  attribute_option_id1: number;
  attribute_option_name1: string;
  image_name: string;
  image_type: string;
  created_time: Date;
  last_modified_time: Date;
  hsn_or_sac: number;
  sat_item_key_code: string;
  unitkey_code: string;
  custom_fields: CustomField[];
}

export interface CustomField {
  customfield_id: string;
  value: string;
}

export interface Location {
  location_id: string;
  location_name: string;
  status: string;
  is_primary: boolean;
  location_stock_on_hand: string;
  location_available_stock: string;
  location_actual_available_stock: string;
}
