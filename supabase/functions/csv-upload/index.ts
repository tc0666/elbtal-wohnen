import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CSVRow {
  imageUrl: string;
  propertyPageUrl: string;
  imageDescription: string;
  propertyId: string;
  title: string;
  location: string;
  priceType: string;
  priceValue: string;
  areaValue: string;
  areaLabel: string;
  additionalValue: string;
  additionalLabel: string;
}

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

    const formData = await req.formData();
    const csvFile = formData.get('file') as File;
    const token = formData.get('token') as string;

    if (!csvFile) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
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

    // Parse CSV content
    const csvText = await csvFile.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    
    console.log('CSV Headers:', headers);

    const properties = [];
    const errors = [];

    // Get default property type ID and fallback city
    const { data: propertyTypes } = await supabase.from('property_types').select('id, name').limit(1);
    const { data: fallbackCities } = await supabase.from('cities').select('id, name').limit(1);
    const defaultPropertyTypeId = propertyTypes?.[0]?.id;
    const fallbackCityId = fallbackCities?.[0]?.id;

    // Cache for cities to avoid duplicate database calls
    const cityCache = new Map();
    
    // Helper function to find or create city
    const findOrCreateCity = async (cityName: string) => {
      if (cityCache.has(cityName)) {
        return cityCache.get(cityName);
      }

      // First try to find existing city
      const { data: existingCity } = await supabase
        .from('cities')
        .select('id')
        .ilike('name', cityName)
        .single();

      if (existingCity) {
        cityCache.set(cityName, existingCity.id);
        return existingCity.id;
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

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',');
        if (values.length < 12) continue;

        const row: CSVRow = {
          imageUrl: values[0]?.trim() || '',
          propertyPageUrl: values[1]?.trim() || '',
          imageDescription: values[2]?.trim() || '',
          propertyId: values[3]?.trim() || '',
          title: values[4]?.trim() || '',
          location: values[5]?.trim() || '',
          priceType: values[6]?.trim() || '',
          priceValue: values[7]?.trim() || '',
          areaValue: values[8]?.trim() || '',
          areaLabel: values[9]?.trim() || '',
          additionalValue: values[10]?.trim() || '',
          additionalLabel: values[11]?.trim() || '',
        };

        console.log(`Processing row ${i}:`, row);

        // Extract postal code and city from location (e.g., "14199, Berlin")
        const locationMatch = row.location.match(/^"?(\d{5}),?\s*(.+?)"?$/);
        let postalCode = '';
        let cityName = '';
        
        if (locationMatch) {
          postalCode = locationMatch[1]; // e.g., "14199"
          cityName = locationMatch[2].trim(); // e.g., "Berlin"
        } else {
          // Fallback parsing
          const parts = row.location.replace(/"/g, '').split(',');
          if (parts.length >= 2) {
            postalCode = parts[0].trim();
            cityName = parts[1].trim();
          } else {
            cityName = row.location.replace(/"/g, '').trim();
          }
        }

        // Parse price - handle formats like "3.24€", "2.13€", etc.
        let priceMonthly = 0;
        if (row.priceValue && row.priceValue !== 'auf Anfrage') {
          // Clean the price value: remove € symbol and quotes
          const cleanPrice = row.priceValue.replace(/[€"]/g, '').trim();
          // For German format, comma is decimal separator
          const normalizedPrice = cleanPrice.replace(',', '.');
          const priceValue = parseFloat(normalizedPrice);
          
          if (!isNaN(priceValue)) {
            // Price like 3.24€ means 324€, so multiply by 100
            priceMonthly = Math.round(priceValue * 100);
          }
        }

        // Parse area - handle formats like "85,28 m²", "139,54 m²", etc.
        let areaSqm = 0;
        if (row.areaValue) {
          // Clean the area value: remove m², quotes, and other units
          const cleanArea = row.areaValue.replace(/[m²"]/g, '').trim();
          // For German format, comma is decimal separator
          const normalizedArea = cleanArea.replace(',', '.');
          const areaValue = parseFloat(normalizedArea);
          
          if (!isNaN(areaValue)) {
            areaSqm = Math.round(areaValue);
          }
        }

        // Parse rooms - from column 10 (additionalValue) - should be just the number
        let rooms = '1';
        if (row.additionalValue && !isNaN(parseInt(row.additionalValue))) {
          const roomNumber = parseInt(row.additionalValue);
          rooms = roomNumber.toString();
        }

        console.log(`Parsed data for row ${i}:`, {
          postalCode,
          cityName,
          priceMonthly,
          areaSqm,
          rooms,
          originalLocation: row.location,
          originalPrice: row.priceValue,
          originalArea: row.areaValue,
          originalRooms: row.additionalValue
        });

        // Find or create the city
        const cityId = await findOrCreateCity(cityName.trim());

        const property = {
          title: row.title,
          description: `Imported from CSV. Original ID: ${row.propertyId}`,
          address: `${postalCode} ${cityName}`, // Show postal code with city
          postal_code: postalCode,
          neighborhood: cityName,
          rooms: rooms,
          area_sqm: areaSqm,
          price_monthly: priceMonthly,
          warmmiete_monthly: priceMonthly,
          additional_costs_monthly: 0,
          property_type_id: defaultPropertyTypeId,
          city_id: cityId || fallbackCityId, // Fallback to first available city if city creation fails
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
          additional_description: `Original CSV data: ${JSON.stringify(row)}`,
          eigenschaften_description: '',
          eigenschaften_tags: [],
          is_featured: false,
          is_active: true,
          images: row.imageUrl ? [row.imageUrl] : [],
        };

        properties.push(property);
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        errors.push(`Row ${i}: ${error.message}`);
      }
    }

    console.log(`Processed ${properties.length} properties, ${errors.length} errors`);

    // Insert properties into database
    const insertResults = [];
    for (const property of properties) {
      try {
        const { data, error } = await supabase
          .from('properties')
          .insert(property)
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
        errors.push(`Failed to insert property "${property.title}": ${error.message}`);
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
    console.error('CSV upload error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});