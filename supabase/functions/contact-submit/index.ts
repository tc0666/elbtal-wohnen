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

    const formData = await req.json()

    // Insert contact request into database
    const { data: request, error } = await supabase
      .from('contact_requests')
      .insert([{
        property_id: formData.propertyId || null,
        anrede: formData.anrede,
        vorname: formData.vorname,
        nachname: formData.nachname,
        email: formData.email,
        telefon: formData.telefon,
        strasse: formData.strasse,
        nummer: formData.nummer,
        plz: formData.plz,
        ort: formData.ort,
        nachricht: formData.nachricht,
        status: 'new'
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Contact request created:', request.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Ihre Anfrage wurde erfolgreich übermittelt.',
        requestId: request.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Es gab einen Fehler beim Senden Ihrer Nachricht. Bitte versuchen Sie es erneut.',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})