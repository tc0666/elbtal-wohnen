import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Resend } from 'npm:resend@2.0.0'

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

    // Send emails using Resend
    try {
      await sendEmailNotifications(formData, request.id)
      console.log('Emails sent successfully via Resend')
    } catch (emailError) {
      console.error('Email error caught:', emailError)
      // We still return 200 so the user gets success on the site, but we log the error for debugging
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Ihre Anfrage wurde erfolgreich übermittelt.',
        requestId: request.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error:', error)
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
  console.log('Starting email notifications for request:', requestId)

  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@resend.dev'
  const adminEmail = Deno.env.get('ADMIN_EMAIL')

  console.log('Resend Configuration:', {
    hasApiKey: !!resendApiKey,
    fromEmail: fromEmail,
    adminEmail: adminEmail
  })

  if (!resendApiKey || !adminEmail) {
    console.error('Missing Resend configuration - API key or admin email missing')
    throw new Error('Missing Resend configuration')
  }

  const resend = new Resend(resendApiKey)

  // Admin email HTML
  const adminHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Neue Kontaktanfrage</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
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
</body>
</html>`

  // User confirmation email HTML
  const userHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Vielen Dank für Ihre Anfrage</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Vielen Dank für Ihre Anfrage</h2>
    
    <p>Sehr geehrte Damen und Herren,</p>
    
    <p>Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich mit Ihnen in Verbindung setzen.</p>
    
    <p>Mit freundlichen Grüßen<br>
    Amiel Immobilienverwaltung</p>
    
    <hr>
    <p style="font-size: 12px; color: #666;">
        Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.<br>
        Bei Fragen kontaktieren Sie uns unter: info@amiel-immobilienverwaltung.de
    </p>
</body>
</html>`

  try {
    // Send admin notification
    console.log('Sending admin email to:', adminEmail)
    const adminEmailResponse = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: 'Neue Kontaktanfrage von der Website',
      html: adminHtml,
      reply_to: formData.email
    })
    
    console.log('Admin email sent successfully:', adminEmailResponse)

    // Send user confirmation
    console.log('Sending user confirmation to:', formData.email)
    const userEmailResponse = await resend.emails.send({
      from: fromEmail,
      to: formData.email,
      subject: 'Vielen Dank für Ihre Anfrage',
      html: userHtml
    })
    
    console.log('User email sent successfully:', userEmailResponse)

  } catch (error) {
    console.error('Failed to send emails via Resend:', error)
    throw error
  }
}