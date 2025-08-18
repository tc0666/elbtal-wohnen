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
    console.log('=== CONTACT SUBMIT FUNCTION START ===')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const formData = await req.json()
    console.log('Form data received:', JSON.stringify(formData, null, 2))

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

    console.log('Contact request created with ID:', request.id)

    // Send emails using Resend
    console.log('Starting email sending process...')
    try {
      await sendEmailNotifications(formData, request.id)
      console.log('=== EMAIL SENDING COMPLETED SUCCESSFULLY ===')
    } catch (emailError) {
      console.error('=== EMAIL SENDING FAILED ===')
      console.error('Email error details:', emailError)
      console.error('Email error message:', emailError?.message)
      console.error('Email error stack:', emailError?.stack)
      // Continue anyway so user gets success message
    }

    console.log('=== RETURNING SUCCESS RESPONSE ===')
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Ihre Anfrage wurde erfolgreich übermittelt.',
        requestId: request.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('=== MAIN FUNCTION ERROR ===')
    console.error('Main error:', error)
    console.error('Main error message:', error?.message)
    console.error('Main error stack:', error?.stack)
    
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

async function sendEmailNotifications(formData: any, requestId: string) {
  console.log('=== STARTING EMAIL NOTIFICATIONS ===')
  console.log('Request ID:', requestId)

  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const fromEmail = Deno.env.get('FROM_EMAIL') || 'onboarding@resend.dev'
  const adminEmail = Deno.env.get('ADMIN_EMAIL')

  console.log('Email configuration check:')
  console.log('- Has Resend API Key:', !!resendApiKey)
  console.log('- From Email:', fromEmail)
  console.log('- Admin Email:', adminEmail)
  console.log('- User Email:', formData.email)

  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is missing')
  }
  
  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL is missing')
  }

  console.log('Attempting to send emails using fetch to Resend API...')

  // Admin email content
  const adminHtmlContent = `
    <h2>Neue Kontaktanfrage eingegangen</h2>
    <h3>Kontaktdaten:</h3>
    <ul>
        <li><strong>Anrede:</strong> ${formData.anrede || 'Nicht angegeben'}</li>
        <li><strong>Vorname:</strong> ${formData.vorname}</li>
        <li><strong>Nachname:</strong> ${formData.nachname}</li>
        <li><strong>E-Mail:</strong> ${formData.email}</li>
        <li><strong>Telefon:</strong> ${formData.telefon}</li>
    </ul>
    <h3>Adresse:</h3>
    <ul>
        <li><strong>Straße:</strong> ${formData.strasse || 'Nicht angegeben'}</li>
        <li><strong>Nummer:</strong> ${formData.nummer || 'Nicht angegeben'}</li>
        <li><strong>PLZ:</strong> ${formData.plz || 'Nicht angegeben'}</li>
        <li><strong>Ort:</strong> ${formData.ort || 'Nicht angegeben'}</li>
    </ul>
    <h3>Nachricht:</h3>
    <p style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">${formData.nachricht}</p>
    ${formData.propertyId ? `<p><strong>Immobilien-ID:</strong> ${formData.propertyId}</p>` : ''}
    <hr>
    <p><small>Anfrage-ID: ${requestId}</small></p>
  `

  // User confirmation content
  const userHtmlContent = `
    <h2>Vielen Dank für Ihre Anfrage</h2>
    <p>Sehr geehrte Damen und Herren,</p>
    <p>Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich mit Ihnen in Verbindung setzen.</p>
    <p>Mit freundlichen Grüßen<br>Amiel Immobilienverwaltung</p>
    <hr>
    <p style="font-size: 12px; color: #666;">
        Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.<br>
        Bei Fragen kontaktieren Sie uns unter: info@amiel-immobilienverwaltung.de
    </p>
  `

  try {
    // Send admin email
    console.log('Sending admin email...')
    const adminEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [adminEmail],
        subject: 'Neue Kontaktanfrage von der Website',
        html: adminHtmlContent,
        reply_to: formData.email
      }),
    })

    const adminResult = await adminEmailResponse.json()
    console.log('Admin email response status:', adminEmailResponse.status)
    console.log('Admin email response:', JSON.stringify(adminResult, null, 2))

    if (!adminEmailResponse.ok) {
      throw new Error(`Admin email failed: ${JSON.stringify(adminResult)}`)
    }

    // Send user confirmation email
    console.log('Sending user confirmation email...')
    const userEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [formData.email],
        subject: 'Vielen Dank für Ihre Anfrage',
        html: userHtmlContent
      }),
    })

    const userResult = await userEmailResponse.json()
    console.log('User email response status:', userEmailResponse.status)
    console.log('User email response:', JSON.stringify(userResult, null, 2))

    if (!userEmailResponse.ok) {
      throw new Error(`User email failed: ${JSON.stringify(userResult)}`)
    }

    console.log('=== BOTH EMAILS SENT SUCCESSFULLY ===')

  } catch (error) {
    console.error('=== EMAIL SENDING ERROR ===')
    console.error('Fetch error details:', error)
    throw error
  }
}