import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { SMTPClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log('=== CONTACT REQUEST RECEIVED ===', new Date().toISOString())
  
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request - returning CORS headers')
    return new Response('ok', { status: 204, headers: corsHeaders })
  }

  try {
    console.log('1. Creating Supabase client...')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    console.log('2. Supabase client created successfully')

    console.log('3. Parsing request body...')
    const formData = await req.json()
    console.log('4. Form data parsed for email:', formData.email)

    console.log('5. Inserting contact request to database...')
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
      console.error('DATABASE ERROR:', error)
      throw new Error(`Database insert failed: ${error.message}`)
    }

    console.log('6. Contact request saved successfully with ID:', request.id)

    console.log('7. Checking SMTP environment variables...')
    const smtpHost = Deno.env.get('SMTP_HOST')
    const smtpPort = Number(Deno.env.get('SMTP_PORT') || '465')
    const smtpUser = Deno.env.get('SMTP_USERNAME')
    const smtpPass = Deno.env.get('SMTP_PASSWORD')
    const adminEmail = Deno.env.get('ADMIN_EMAIL')
    const fromEmail = Deno.env.get('FROM_EMAIL')

    console.log('Environment check results:')
    console.log('- SMTP_HOST exists:', !!smtpHost)
    console.log('- SMTP_PORT exists:', !!Deno.env.get('SMTP_PORT'))
    console.log('- SMTP_USERNAME exists:', !!smtpUser)
    console.log('- SMTP_PASSWORD exists:', !!smtpPass)
    console.log('- ADMIN_EMAIL exists:', !!adminEmail)
    console.log('- FROM_EMAIL exists:', !!fromEmail)

    if (!smtpHost || !smtpUser || !smtpPass || !adminEmail || !fromEmail) {
      throw new Error('SMTP/Email environment variables are missing')
    }

    console.log('8. Preparing email content...')
    const emailFrom = fromEmail
    
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Neue Kontaktanfrage von der Website</h2>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 5px;">
          <p><strong>Name:</strong> ${formData.vorname} ${formData.nachname}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Telefon:</strong> ${formData.telefon || 'Nicht angegeben'}</p>
          <p><strong>Adresse:</strong> ${formData.strasse} ${formData.nummer}, ${formData.plz} ${formData.ort}</p>
          <p><strong>Nachricht:</strong></p>
          <div style="background: white; padding: 10px; border-left: 3px solid #007cba;">
            ${formData.nachricht || 'Keine Nachricht angegeben'}
          </div>
          <p><strong>Anfrage-ID:</strong> ${request.id}</p>
          <p><strong>Zeitpunkt:</strong> ${new Date().toLocaleString('de-DE')}</p>
        </div>
      </div>
    `

    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Vielen Dank für Ihre Anfrage</h2>
        <p>Sehr geehrte Damen und Herren,</p>
        <p>wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich mit Ihnen in Verbindung setzen.</p>
        <p>Ihre Anfrage-ID lautet: <strong>${request.id}</strong></p>
        <p>Mit freundlichen Grüßen<br><strong>Amiel Immobilienverwaltung</strong></p>
      </div>
    `

    console.log('9. Creating SMTP client...')
    const smtpClient = new SMTPClient({
      connection: {
        hostname: smtpHost!,
        port: smtpPort,
        tls: true,
        auth: { username: smtpUser!, password: smtpPass! },
      },
    })

    console.log('10. Sending admin notification email via SMTP...')
    await smtpClient.send({
      from: emailFrom!,
      to: adminEmail!,
      subject: 'Neue Kontaktanfrage von der Website',
      content: 'Ihre E-Mail unterstützt kein HTML.',
      html: adminEmailHtml,
      headers: { 'Reply-To': formData.email },
    })

    console.log('11. Admin email sent successfully')

    console.log('12. Sending user confirmation email via SMTP...')
    try {
      await smtpClient.send({
        from: emailFrom!,
        to: formData.email,
        subject: 'Bestätigung Ihrer Anfrage - Amiel Immobilienverwaltung',
        content: 'Ihre E-Mail unterstützt kein HTML.',
        html: userEmailHtml,
      })
      console.log('13. User email sent successfully')
    } catch (userErr) {
      console.error('USER EMAIL FAILED:', userErr?.message || userErr)
      console.log('Continuing despite user email failure...')
    }

    await smtpClient.close()
    console.log('14. SMTP client closed')

    console.log('15. === CONTACT FORM PROCESSING COMPLETED SUCCESSFULLY ===')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Ihre Anfrage wurde erfolgreich übermittelt. Sie erhalten in Kürze eine Bestätigungsmail.',
        requestId: request.id
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error: any) {
    console.error('=== CONTACT FORM ERROR ===')
    console.error('Error type:', typeof error)
    console.error('Error message:', error?.message || 'Unknown error')
    console.error('Error stack:', error?.stack || 'No stack trace')
    console.error('Full error object:', JSON.stringify(error, null, 2))
    
    return new Response(
      JSON.stringify({
        error: 'Es gab einen Fehler beim Verarbeiten Ihrer Anfrage. Bitte versuchen Sie es erneut.',
        details: error?.message || 'Unbekannter Fehler'
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    )
  }
})