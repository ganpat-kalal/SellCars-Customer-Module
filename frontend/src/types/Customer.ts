export interface ContactPerson {
  first_name: string;
  last_name: string;
  email?: string;
  mobile_phone?: string;
  birth_date?: string;
}

export interface Address {
  company_name: string;
  country: string;
  city: string;
  zip: string;
  street: string;
  fax?: string;
  phone?: string;
  email?: string;
}

export interface Customer {
  intnr: string;
  contact_persons: ContactPerson[];
  addresses: Address[];
}
