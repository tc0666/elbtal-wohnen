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

    // Get default city and property type IDs
    const { data: cities } = await supabase.from('cities').select('id, name').limit(1);
    const { data: propertyTypes } = await supabase.from('property_types').select('id, name').limit(1);
    
    const defaultCityId = cities?.[0]?.id;
    const defaultPropertyTypeId = propertyTypes?.[0]?.id;

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

        // Extract postal code and city from location
        const locationMatch = row.location.match(/(\d{5}),?\s*(.+)/);
        const postalCode = locationMatch?.[1] || '';
        const cityName = locationMatch?.[2] || row.location;

        // Parse price
        let priceMonthly = 0;
        const priceMatch = row.priceValue.match(/[\d.,]+/);
        if (priceMatch && row.priceValue !== 'auf Anfrage') {
          priceMonthly = Math.round(parseFloat(priceMatch[0].replace(',', '.')) * 100); // Convert to cents
        }

        // Parse area
        let areaSqm = 0;
        const areaMatch = row.areaValue.match(/[\d.,]+/);
        if (areaMatch) {
          areaSqm = Math.round(parseFloat(areaMatch[0].replace(',', '.')));
        }

        // Parse rooms from additional data
        let rooms = '1';
        if (row.additionalLabel.toLowerCase().includes('zimmer')) {
          rooms = row.additionalValue || '1';
        }

        const property = {
          title: row.title,
          description: `Imported from CSV. Original ID: ${row.propertyId}`,
          address: cityName,
          postal_code: postalCode,
          neighborhood: cityName,
          rooms: rooms,
          area_sqm: areaSqm,
          price_monthly: priceMonthly,
          warmmiete_monthly: priceMonthly,
          additional_costs_monthly: 0,
          property_type_id: defaultPropertyTypeId,
          city_id: defaultCityId,
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