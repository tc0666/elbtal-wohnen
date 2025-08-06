import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { propertyData } = await req.json()
    
    console.log('Received property data:', JSON.stringify(propertyData, null, 2))

    // Minimal validation
    if (!propertyData || !propertyData.title) {
      return new Response(
        JSON.stringify({ error: 'Property title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Clean and prepare the data
    const cleanData = {
      title: String(propertyData.title).trim(),
      description: propertyData.description || '',
      address: propertyData.address || 'Default Address',
      postal_code: propertyData.postal_code || '',
      neighborhood: propertyData.neighborhood || '',
      rooms: propertyData.rooms || '1',
      area_sqm: Math.max(1, parseInt(propertyData.area_sqm) || 50),
      price_monthly: Math.max(1, parseInt(propertyData.price_monthly) || 500),
      warmmiete_monthly: propertyData.warmmiete_monthly ? parseInt(propertyData.warmmiete_monthly) : null,
      additional_costs_monthly: propertyData.additional_costs_monthly ? parseInt(propertyData.additional_costs_monthly) : null,
      property_type_id: propertyData.property_type_id || null,
      city_id: propertyData.city_id || null,
      floor: propertyData.floor ? parseInt(propertyData.floor) : null,
      total_floors: propertyData.total_floors ? parseInt(propertyData.total_floors) : null,
      year_built: propertyData.year_built ? parseInt(propertyData.year_built) : null,
      available_from: propertyData.available_from || null,
      deposit_months: propertyData.deposit_months ? parseInt(propertyData.deposit_months) : 3,
      kitchen_equipped: Boolean(propertyData.kitchen_equipped),
      furnished: Boolean(propertyData.furnished),
      pets_allowed: Boolean(propertyData.pets_allowed),
      utilities_included: Boolean(propertyData.utilities_included),
      balcony: Boolean(propertyData.balcony),
      elevator: Boolean(propertyData.elevator),
      parking: Boolean(propertyData.parking),
      garden: Boolean(propertyData.garden),
      cellar: Boolean(propertyData.cellar),
      attic: Boolean(propertyData.attic),
      dishwasher: Boolean(propertyData.dishwasher),
      washing_machine: Boolean(propertyData.washing_machine),
      dryer: Boolean(propertyData.dryer),
      tv: Boolean(propertyData.tv),
      energy_certificate_type: propertyData.energy_certificate_type || null,
      energy_certificate_value: propertyData.energy_certificate_value || null,
      heating_type: propertyData.heating_type || null,
      heating_energy_source: propertyData.heating_energy_source || null,
      internet_speed: propertyData.internet_speed || null,
      features_description: propertyData.features_description || null,
      additional_description: propertyData.additional_description || null,
      eigenschaften_description: propertyData.eigenschaften_description || null,
      eigenschaften_tags: Array.isArray(propertyData.eigenschaften_tags) ? propertyData.eigenschaften_tags : [],
      is_featured: Boolean(propertyData.is_featured),
      is_active: true,
      images: Array.isArray(propertyData.images) ? propertyData.images : []
    }

    console.log('Clean data to insert:', JSON.stringify(cleanData, null, 2))

    const { data: newProperty, error } = await supabase
      .from('properties')
      .insert([cleanData])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: `Database error: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Property created successfully:', newProperty)

    return new Response(
      JSON.stringify({ property: newProperty }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: `Function error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})