export interface LocationData {
  locations: Locations;
}

export interface Locations {
  code: number;
  message: string;
  locations: Location[];
}

export interface Location {
  location_id: string;
  location_name: string;
  type: string;
  address: Address;
  phone: string;
  tax_settings_id: string;
  tax_reg_no?: string;
  website: string;
  fax: string;
  email: string;
  is_location_active: boolean;
  is_primary_location: boolean;
  autonumbergenerationgroup_id: string;
  autonumbergenerationgroup_name: string;
  parent_location_id: string;
  is_storage_location_enabled: boolean;
  total_zones: number;
  shippingzones: any[];
  is_fba_location: boolean;
  sales_channels: any[];
}

export interface Address {
  attention: string;
  street_address1: string;
  street_address2: string;
  city: string;
  postal_code: string;
  country: string;
  state: string;
  state_code: string;
}
