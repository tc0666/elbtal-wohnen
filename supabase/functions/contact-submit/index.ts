import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('Contact function module loaded successfully')

serve(async (req) => {
  console.log('=== REQUEST RECEIVED ===', new Date().toISOString())
  
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request - returning CORS headers')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Creating Supabase client...')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    console.log('Supabase client created')

    console.log('Parsing form data...')
    const formData = await req.json()
    console.log('Form data received for:', formData.email)

    console.log('Inserting to database...')
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

    console.log('Contact request saved with ID:', request.id)

    // Check environment variables
    console.log('Checking environment variables...')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const adminEmail = Deno.env.get('ADMIN_EMAIL')
    const fromEmail = Deno.env.get('FROM_EMAIL')
    
    console.log('Environment check:')
    console.log('- RESEND_API_KEY exists:', !!resendApiKey)
    console.log('- ADMIN_EMAIL:', adminEmail)
    console.log('- FROM_EMAIL:', fromEmail)

    if (!resendApiKey) {
      console.error('RESEND_API_KEY is missing!')
      throw new Error('RESEND_API_KEY not configured')
    }

    if (!adminEmail) {
      console.error('ADMIN_EMAIL is missing!')
      throw new Error('ADMIN_EMAIL not configured')
    }

    console.log('Starting email sending...')
    
    const emailFrom = fromEmail || 'onboarding@resend.dev'
    
    // Prepare email content
    const adminEmailHtml = `
      <h2>Neue Kontaktanfrage</h2>
      <p><strong>Name:</strong> ${formData.vorname} ${formData.nachname}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Telefon:</strong> ${formData.telefon}</p>
      <p><strong>Nachricht:</strong></p>
      <p>${formData.nachricht}</p>
      <p><strong>Anfrage-ID:</strong> ${request.id}</p>
    `

    const userEmailHtml = `
      <h2>Vielen Dank für Ihre Anfrage</h2>
      <p>Sehr geehrte Damen und Herren,</p>
      <p>Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich mit Ihnen in Verbindung setzen.</p>
      <p>Mit freundlichen Grüßen<br>Amiel Immobilienverwaltung</p>
    `

    console.log('Sending admin email via Resend API...')
    
    // Send admin email
    const adminResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [adminEmail],
        subject: 'Neue Kontaktanfrage von der Website',
        html: adminEmailHtml,
        reply_to: formData.email
      }),
    })

    console.log('Admin email response status:', adminResponse.status)
    const adminResult = await adminResponse.json()
    console.log('Admin email result:', JSON.stringify(adminResult))

    if (!adminResponse.ok) {
      console.error('Admin email failed:', adminResult)
      throw new Error(`Admin email failed: ${adminResponse.status}`)
    }

    console.log('Sending user confirmation email...')
    
    // Send user confirmation email
    const userResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [formData.email],
        subject: 'Vielen Dank für Ihre Anfrage',
        html: userEmailHtml
      }),
    })

    console.log('User email response status:', userResponse.status)
    const userResult = await userResponse.json()
    console.log('User email result:', JSON.stringify(userResult))

    if (!userResponse.ok) {
      console.error('User email failed:', userResult)
      throw new Error(`User email failed: ${userResponse.status}`)
    }

    console.log('=== BOTH EMAILS SENT SUCCESSFULLY ===')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Ihre Anfrage wurde erfolgreich übermittelt.',
        requestId: request.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('=== FUNCTION ERROR ===')
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    console.error('Full error:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Es gab einen Fehler beim Senden Ihrer Nachricht. Bitte versuchen Sie es erneut.',
        details: error?.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})