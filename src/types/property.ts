// Shared property types for consistency across components

export interface PropertyBase {
  id: string;
  title: string;
  description: string;
  address: string;
  postal_code: string;
  neighborhood: string;
  rooms: string;
  area_sqm: number;
  price_monthly: number;
  warmmiete_monthly: number;
  additional_costs_monthly: number;
  property_type_id: string;
  city_id: string;
  floor: number;
  total_floors: number;
  year_built: number;
  available_from: string;
  deposit_months: number;
  kitchen_equipped: boolean;
  furnished: boolean;
  pets_allowed: boolean;
  utilities_included: boolean;
  balcony: boolean;
  elevator: boolean;
  parking: boolean;
  garden: boolean;
  cellar: boolean;
  attic: boolean;
  dishwasher: boolean;
  washing_machine: boolean;
  dryer: boolean;
  tv: boolean;
  energy_certificate_type: string;
  energy_certificate_value: string;
  heating_type: string;
  heating_energy_source: string;
  internet_speed: string;
  features_description: string;
  additional_description: string;
  neighborhood_description: string;
  is_featured: boolean;
  is_active: boolean;
  images: string[];
  features: string[];
}

// Property with populated relations (for display)
export interface PropertyWithRelations extends PropertyBase {
  city: { name: string };
  property_type: { name: string };
}

// Property for form editing (all fields optional except required ones)
export interface PropertyFormData extends Partial<PropertyBase> {
  title: string;
  rooms: string;
  area_sqm: number;
  price_monthly: number;
  warmmiete_monthly?: number;
  city_id: string;
  property_type_id: string;
  address: string;
}