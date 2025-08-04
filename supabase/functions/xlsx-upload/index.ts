import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { properties, token } = await req.json();

    if (!properties || !Array.isArray(properties)) {
      return new Response(JSON.stringify({ error: 'No properties provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify admin session
    const { data: session } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (!session) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get default property type ID and fallback city
    const { data: propertyTypes } = await supabase.from('property_types').select('id, name').limit(1);
    const { data: fallbackCities } = await supabase.from('cities').select('id, name').limit(1);
    const defaultPropertyTypeId = propertyTypes?.[0]?.id;
    const fallbackCityId = fallbackCities?.[0]?.id;

    // Cache for cities to avoid duplicate database calls
    const cityCache = new Map();
    
    // Helper function to find or create city
    const findOrCreateCity = async (cityName: string) => {
      if (!cityName || cityName.trim() === '') {
        return fallbackCityId;
      }
      
      const cleanCityName = cityName.trim();
      
      if (cityCache.has(cleanCityName)) {
        return cityCache.get(cleanCityName);
      }

      // First try to find existing city (exact match first, then case-insensitive)
      const { data: existingCity } = await supabase
        .from('cities')
        .select('id')
        .eq('name', cleanCityName)
        .single();

      if (existingCity) {
        cityCache.set(cleanCityName, existingCity.id);
        return existingCity.id;
      }

      // Try case-insensitive match
      const { data: existingCityInsensitive } = await supabase
        .from('cities')
        .select('id, name')
        .ilike('name', cleanCityName)
        .single();

      if (existingCityInsensitive) {
        cityCache.set(cleanCityName, existingCityInsensitive.id);
        return existingCityInsensitive.id;
      }

      // If not found, create new city
      const slug = cityName.toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const { data: newCity } = await supabase
        .from('cities')
        .insert({
          name: cityName,
          slug: slug,
          display_order: 999,
          is_active: true
        })
        .select('id')
        .single();

      if (newCity) {
        cityCache.set(cityName, newCity.id);
        return newCity.id;
      }

      return null;
    };

    const insertResults = [];
    const errors = [];

    for (let i = 0; i < properties.length; i++) {
      try {
        const property = properties[i];
        
        console.log(`Processing property ${i + 1}:`, property);

        // Find or create the city
        const cityId = await findOrCreateCity(property.city_name || 'Unknown');

        const propertyToInsert = {
          title: property.title,
          description: property.description || `Imported from XLSX`,
          address: property.address,
          postal_code: property.postal_code,
          neighborhood: property.neighborhood,
          rooms: property.rooms,
          area_sqm: property.area_sqm,
          price_monthly: property.price_monthly,
          warmmiete_monthly: property.warmmiete_monthly,
          additional_costs_monthly: property.additional_costs_monthly,
          property_type_id: defaultPropertyTypeId,
          city_id: cityId || fallbackCityId,
          floor: 1,
          total_floors: 5,
          year_built: 2000,
          available_from: new Date().toISOString().split('T')[0],
          deposit_months: 3,
          kitchen_equipped: false,
          furnished: false,
          pets_allowed: false,
          utilities_included: false,
          balcony: false,
          elevator: false,
          parking: false,
          garden: false,
          cellar: false,
          attic: false,
          dishwasher: false,
          washing_machine: false,
          dryer: false,
          tv: false,
          energy_certificate_type: 'Verbrauchsausweis',
          energy_certificate_value: '100',
          heating_type: 'Zentralheizung',
          heating_energy_source: 'Gas',
          internet_speed: '100 Mbit/s',
          features_description: '',
          additional_description: `Imported from XLSX: ${JSON.stringify(property)}`,
          eigenschaften_description: '',
          eigenschaften_tags: [],
          is_featured: false,
          is_active: true,
          images: property.images || [],
        };

        const { data, error } = await supabase
          .from('properties')
          .insert(propertyToInsert)
          .select()
          .single();

        if (error) {
          console.error('Database insert error:', error);
          errors.push(`Failed to insert property "${property.title}": ${error.message}`);
        } else {
          insertResults.push(data);
        }
      } catch (error) {
        console.error('Insert error:', error);
        errors.push(`Failed to insert property "${property.title || 'Unknown'}": ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        imported: insertResults.length,
        total: properties.length,
        errors: errors,
        message: `Successfully imported ${insertResults.length} properties out of ${properties.length} total`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('XLSX upload error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});