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

        // Parse postcode-city field
        let postalCode = '';
        let cityName = '';
        if (property['postcode-city']) {
          const postcodeCity = property['postcode-city'].toString().trim();
          const match = postcodeCity.match(/^(\d{5})\s+(.+)$/);
          if (match) {
            postalCode = match[1];
            cityName = match[2];
          } else {
            // Fallback: try to split by space and assume first part is postcode
            const parts = postcodeCity.split(' ');
            if (parts.length >= 2 && /^\d{5}$/.test(parts[0])) {
              postalCode = parts[0];
              cityName = parts.slice(1).join(' ');
            } else {
              cityName = postcodeCity;
            }
          }
        }

        // Find or create the city
        const cityId = await findOrCreateCity(cityName || 'Unknown');

        // Parse available date
        let availableFrom = new Date().toISOString().split('T')[0];
        if (property['Verfügbar']) {
          try {
            const verfugbarDate = new Date(property['Verfügbar']);
            if (!isNaN(verfugbarDate.getTime())) {
              availableFrom = verfugbarDate.toISOString().split('T')[0];
            }
          } catch (e) {
            console.log('Could not parse Verfügbar date:', property['Verfügbar']);
          }
        }

        // Collect all images and filter duplicates
        const allImageSources = [];
        
        // Add featured image first
        if (property['image-featured'] && property['image-featured'].trim()) {
          allImageSources.push(property['image-featured'].trim());
        }
        
        // Add additional images
        for (let imgNum = 1; imgNum <= 7; imgNum++) {
          const imgKey = `image-${imgNum}`;
          if (property[imgKey] && property[imgKey].trim()) {
            allImageSources.push(property[imgKey].trim());
          }
        }
        
        // Remove duplicates while preserving order
        const images = allImageSources.filter((img, index, arr) => 
          arr.indexOf(img) === index && img !== ''
        );

        console.log('Image processing for property:', {
          allImageSources,
          filteredImages: images,
          duplicatesRemoved: allImageSources.length - images.length
        });

        // Parse numeric values with proper European currency handling
        const parseNumber = (value, fallback = 0) => {
          if (!value) return fallback;
          
          // Convert to string and clean up
          const str = value.toString().trim();
          
          // Check if this looks like European currency format (e.g., 1.360€, 1.36€)
          const europeanCurrencyMatch = str.match(/^(\d+)\.(\d+)€?$/);
          if (europeanCurrencyMatch) {
            const wholePart = europeanCurrencyMatch[1];
            const fractionalPart = europeanCurrencyMatch[2];
            
            // If fractional part is 2-3 digits, treat dot as thousands separator
            // e.g., 1.360€ = 1360€, 1.36€ = 136€
            if (fractionalPart.length <= 3) {
              return parseInt(wholePart + fractionalPart);
            }
          }
          
          // Remove currency symbols and spaces
          const cleaned = str.replace(/[€$£¥\s]/g, '');
          
          // Handle German decimal notation (comma as decimal separator)
          if (cleaned.includes(',') && !cleaned.includes('.')) {
            const normalized = cleaned.replace(',', '.');
            const parsed = parseFloat(normalized);
            return isNaN(parsed) ? fallback : Math.round(parsed);
          }
          
          // Handle standard decimal notation
          const numberStr = cleaned.replace(/[^\d.]/g, '');
          const parsed = parseFloat(numberStr);
          return isNaN(parsed) ? fallback : Math.round(parsed);
        };

        console.log('Original property data:', {
          Title: property['Title'],
          Rent: property['Rent'],
          Nebenkosten: property['Nebenkosten'],
          size: property['size'],
          'image-featured': property['image-featured'],
          'image-1': property['image-1'],
          'image-2': property['image-2']
        });

        const propertyToInsert = {
          title: property['Title'] || 'Untitled Property',
          description: property['Objektbeschreibung'] || 'Imported from XLSX',
          address: property['address'] || '',
          postal_code: postalCode,
          neighborhood: cityName,
          rooms: property['zimmer']?.toString() || '1',
          area_sqm: parseNumber(property['size'], 50),
          price_monthly: parseNumber(property['Rent']),
          warmmiete_monthly: parseNumber(property['Rent']) + parseNumber(property['Nebenkosten']),
          additional_costs_monthly: parseNumber(property['Nebenkosten']),
          property_type_id: defaultPropertyTypeId,
          city_id: cityId || fallbackCityId,
          floor: 1,
          total_floors: 5,
          year_built: 2000,
          available_from: availableFrom,
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
          features_description: property['Ausstattungsmerkmale'] || '',
          additional_description: property['Weitere'] || '',
          eigenschaften_description: '',
          eigenschaften_tags: [],
          is_featured: false,
          is_active: true,
          images: images,
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