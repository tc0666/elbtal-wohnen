import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"

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

    // Send emails in background with better error handling
    const emailPromise = sendEmailNotifications(formData, request.id)
    
    emailPromise.catch(error => {
      console.error('Email sending failed:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
    })
    
    // Wait for email sending to complete
    try {
      await emailPromise
      console.log('Emails sent successfully')
    } catch (emailError) {
      console.error('Email error caught:', emailError)
      // Don't fail the request if emails fail, but log the error
    }

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

async function sendEmailNotifications(formData: any, requestId: string) {
  console.log('Starting email notifications for request:', requestId)
  
  const smtpHost = Deno.env.get('SMTP_HOST')
  const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '465')
  const smtpUsername = Deno.env.get('SMTP_USERNAME')
  const smtpPassword = Deno.env.get('SMTP_PASSWORD')
  const fromEmail = Deno.env.get('FROM_EMAIL')
  const adminEmail = Deno.env.get('ADMIN_EMAIL')

  console.log('SMTP Configuration:', {
    host: smtpHost,
    port: smtpPort,
    username: smtpUsername,
    fromEmail: fromEmail,
    adminEmail: adminEmail,
    hasPassword: !!smtpPassword
  })

  if (!smtpHost || !smtpUsername || !smtpPassword || !fromEmail || !adminEmail) {
    console.error('Missing SMTP configuration - stopping email send')
    throw new Error('Missing SMTP configuration')
  }

  const client = new SMTPClient({
    connection: {
      hostname: smtpHost,
      port: smtpPort,
      tls: true,
      auth: {
        username: smtpUsername,
        password: smtpPassword,
      },
    },
  })

  const messageId = `<${requestId}@amiel-immobilienverwaltung.de>`

  try {
    // 1. Send admin notification
    const adminEmailContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Neue Kontaktanfrage</title></head><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><h2>Neue Kontaktanfrage eingegangen</h2><h3>Kontaktdaten:</h3><ul><li><strong>Anrede:</strong> ${formData.anrede || 'Nicht angegeben'}</li><li><strong>Vorname:</strong> ${formData.vorname}</li><li><strong>Nachname:</strong> ${formData.nachname}</li><li><strong>E-Mail:</strong> ${formData.email}</li><li><strong>Telefon:</strong> ${formData.telefon}</li></ul><h3>Adresse:</h3><ul><li><strong>Straße:</strong> ${formData.strasse || 'Nicht angegeben'}</li><li><strong>Nummer:</strong> ${formData.nummer || 'Nicht angegeben'}</li><li><strong>PLZ:</strong> ${formData.plz || 'Nicht angegeben'}</li><li><strong>Ort:</strong> ${formData.ort || 'Nicht angegeben'}</li></ul><h3>Nachricht:</h3><p style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">${formData.nachricht}</p>${formData.propertyId ? `<p><strong>Immobilien-ID:</strong> ${formData.propertyId}</p>` : ''}<hr><p><small>Anfrage-ID: ${requestId}</small></p></body></html>`

    await client.send({
      from: fromEmail,
      to: adminEmail,
      subject: "Neue Kontaktanfrage von der Website",
      html: adminEmailContent,
      headers: {
        "Message-ID": messageId + "-admin",
        "Return-Path": fromEmail,
        "Reply-To": formData.email,
        "MIME-Version": "1.0",
        "Content-Type": "text/html; charset=UTF-8",
        "X-Mailer": "Amiel Immobilienverwaltung Contact System"
      }
    })

    console.log('Admin notification sent successfully')

    // 2. Send user confirmation
    const userConfirmationContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Vielen Dank für Ihre Anfrage</title></head><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><h2>Vielen Dank für Ihre Anfrage</h2><p>Sehr geehrte Damen und Herren,</p><p>Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich mit Ihnen in Verbindung setzen.</p><p>Mit freundlichen Grüßen<br>Amiel Immobilienverwaltung</p><hr><p style="font-size: 12px; color: #666;">Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.<br>Bei Fragen kontaktieren Sie uns unter: info@amiel-immobilienverwaltung.de</p></body></html>`

    await client.send({
      from: fromEmail,
      to: formData.email,
      subject: "Vielen Dank für Ihre Anfrage",
      html: userConfirmationContent,
      headers: {
        "Message-ID": messageId + "-user",
        "Return-Path": fromEmail,
        "Reply-To": fromEmail,
        "MIME-Version": "1.0",
        "Content-Type": "text/html; charset=UTF-8",
        "X-Mailer": "Amiel Immobilienverwaltung Contact System"
      }
    })

    console.log('User confirmation sent successfully')

  } catch (error) {
    console.error('Failed to send emails:', error)
    throw error
  } finally {
    await client.close()
  }
}