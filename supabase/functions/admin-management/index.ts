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

      case 'get_property_inquiries':
        const { propertyId } = data
        const { data: inquiries, error: inquiriesError } = await supabase
          .from('contact_requests')
          .select('*')
          .eq('property_id', propertyId)
          .order('created_at', { ascending: false })

        if (inquiriesError) throw inquiriesError

        return new Response(
          JSON.stringify({ inquiries }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get_analytics':
        const { timeRange } = data
        const daysAgo = parseInt(timeRange) || 30
        const dateThreshold = new Date()
        dateThreshold.setDate(dateThreshold.getDate() - daysAgo)
        
        // Get all properties count
        const { data: allProperties, error: propCountError } = await supabase
          .from('properties')
          .select('id, title, is_active')
        
        if (propCountError) throw propCountError
        
        // Get all contact requests
        const { data: allRequests, error: allRequestsError } = await supabase
          .from('contact_requests')
          .select('id, status, created_at, property_id')
        
        if (allRequestsError) throw allRequestsError
        
        // Get inquiries by property to find trending properties
        const propertyInquiries = {}
        allRequests.forEach(request => {
          if (request.property_id) {
            if (!propertyInquiries[request.property_id]) {
              propertyInquiries[request.property_id] = 0
            }
            propertyInquiries[request.property_id]++
          }
        })
        
        // Create trending properties list
        const topPerformingProperties = allProperties
          .map(property => ({
            id: property.id,
            title: property.title,
            inquiries: propertyInquiries[property.id] || 0
          }))
          .sort((a, b) => b.inquiries - a.inquiries)
          .slice(0, 10)
        
        // Calculate inquiries by status
        const inquiriesByStatus = allRequests.reduce((acc, request) => {
          const existing = acc.find(item => item.status === request.status)
          if (existing) {
            existing.count++
          } else {
            acc.push({ status: request.status, count: 1 })
          }
          return acc
        }, [])
        
        // Filter recent inquiries
        const recentRequests = allRequests.filter(request => 
          new Date(request.created_at) >= dateThreshold
        )
        
        // Calculate monthly trends starting from August 2025 (12 months forward)
        const monthlyInquiries = []
        const startYear = 2025
        const startMonth = 7 // August (0-based index)
        
        for (let i = 0; i < 12; i++) {
          const targetMonth = (startMonth + i) % 12
          const targetYear = startYear + Math.floor((startMonth + i) / 12)
          
          const monthStart = new Date(targetYear, targetMonth, 1)
          const monthEnd = new Date(targetYear, targetMonth + 1, 0)
          
          const monthCount = allRequests.filter(request => {
            const reqDate = new Date(request.created_at)
            return reqDate >= monthStart && reqDate <= monthEnd
          }).length
          
          const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
          monthlyInquiries.push({
            month: `${monthNames[targetMonth]} ${targetYear.toString().slice(-2)}`,
            count: monthCount,
            year: targetYear
          })
        }
        
        const analytics = {
          totalProperties: allProperties.length,
          activeProperties: allProperties.filter(p => p.is_active).length,
          totalInquiries: allRequests.length,
          newInquiries: allRequests.filter(r => r.status === 'new').length,
          inquiriesThisMonth: recentRequests.length,
          topPerformingProperties,
          inquiriesByStatus,
          monthlyInquiries
        }
        
        return new Response(
          JSON.stringify({ analytics }),
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
        const propertyData = data.propertyData || data.property;
        
        if (!propertyData) {
          throw new Error('Property data is required');
        }

        // Ensure required fields are present
        const processedPropertyData = {
          ...propertyData,
          // Set defaults for required fields if missing
          is_active: propertyData.is_active !== undefined ? propertyData.is_active : true,
          is_featured: propertyData.is_featured !== undefined ? propertyData.is_featured : false,
          images: propertyData.images || [],
          features: propertyData.features || [],
          eigenschaften_tags: propertyData.eigenschaften_tags || []
        };

        console.log('Creating property with data:', JSON.stringify(processedPropertyData, null, 2));

        const { data: newProperty, error: createError } = await supabase
          .from('properties')
          .insert([processedPropertyData])
          .select()
          .single()

        if (createError) {
          console.error('Create property error:', createError);
          throw createError;
        }

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

      case 'bulk_delete_properties':
        const { error: bulkDeleteError } = await supabase
          .from('properties')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000') // This will delete all properties
        
        if (bulkDeleteError) {
          return new Response(
            JSON.stringify({ error: 'Failed to delete properties', details: bulkDeleteError.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
              status: 400 
            }
          )
        }
        
        return new Response(
          JSON.stringify({ success: true, message: 'All properties deleted successfully' }),
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