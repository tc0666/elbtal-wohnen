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

    const { action, token, ...data } = await req.json()

    // Verify admin token using sessions table
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 401 
        }
      )
    }

    // Verify session token in admin_sessions table
    const { data: sessionData, error: sessionError } = await supabase
      .from('admin_sessions')
      .select('user_id, is_active, expires_at')
      .eq('token', token)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (sessionError || !sessionData) {
      console.error('Invalid session:', sessionError)
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 401 
        }
      )
    }

    // Handle different actions
    switch (action) {
      case 'get_properties':
        const { data: properties, error: propError } = await supabase
          .from('properties')
          .select(`
            *,
            city:cities(name),
            property_type:property_types(name)
          `)
          .order('created_at', { ascending: false })

        if (propError) throw propError

        return new Response(
          JSON.stringify({ properties }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get_contact_requests':
        const { data: requests, error: reqError } = await supabase
          .from('contact_requests')
          .select(`
            *,
            property:properties(title, address)
          `)
          .order('created_at', { ascending: false })

        if (reqError) throw reqError

        return new Response(
          JSON.stringify({ requests }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get_cities':
        const { data: cities, error: citiesError } = await supabase
          .from('cities')
          .select('*')
          .order('display_order', { ascending: true })

        if (citiesError) throw citiesError

        return new Response(
          JSON.stringify({ cities }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get_property_types':
        const { data: types, error: typesError } = await supabase
          .from('property_types')
          .select('*')
          .order('display_order', { ascending: true })

        if (typesError) throw typesError

        return new Response(
          JSON.stringify({ property_types: types }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'create_property':
        const { data: newProperty, error: createError } = await supabase
          .from('properties')
          .insert([data.property])
          .select()
          .single()

        if (createError) throw createError

        return new Response(
          JSON.stringify({ property: newProperty }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'update_property':
        const { data: updatedProperty, error: updateError } = await supabase
          .from('properties')
          .update(data.property)
          .eq('id', data.id)
          .select()
          .single()

        if (updateError) throw updateError

        return new Response(
          JSON.stringify({ property: updatedProperty }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'delete_property':
        const { error: deleteError } = await supabase
          .from('properties')
          .delete()
          .eq('id', data.id)

        if (deleteError) throw deleteError

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'create_city':
        const { data: newCity, error: cityCreateError } = await supabase
          .from('cities')
          .insert([data.city])
          .select()
          .single()

        if (cityCreateError) throw cityCreateError

        return new Response(
          JSON.stringify({ city: newCity }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'update_contact_request_status':
        const { data: updatedRequest, error: statusError } = await supabase
          .from('contact_requests')
          .update({ status: data.status })
          .eq('id', data.id)
          .select()
          .single()

        if (statusError) throw statusError

        return new Response(
          JSON.stringify({ request: updatedRequest }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'update_city':
        const { cityId, city: cityUpdateData } = data
        
        const { data: updatedCity, error: updateCityError } = await supabase
          .from('cities')
          .update({
            name: cityUpdateData.name,
            slug: cityUpdateData.slug,
            display_order: cityUpdateData.display_order,
            is_active: cityUpdateData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', cityId)
          .select()
          .single()
        
        if (updateCityError) {
          return new Response(
            JSON.stringify({ error: 'Failed to update city', details: updateCityError.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
              status: 400 
            }
          )
        }
        
        return new Response(
          JSON.stringify({ city: updatedCity }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'delete_city':
        const { cityId: deleteId } = data
        
        const { error: deleteCityError } = await supabase
          .from('cities')
          .delete()
          .eq('id', deleteId)
        
        if (deleteCityError) {
          return new Response(
            JSON.stringify({ error: 'Failed to delete city', details: deleteCityError.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
              status: 400 
            }
          )
        }
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 400 
          }
        )
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})