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

    // Send emails (we await to guarantee delivery or clear error logging)
    try {
      await sendEmailNotifications(formData, request.id)
      console.log('Emails sent successfully')
    } catch (emailError) {
      console.error('Email error caught (top-level):', emailError)
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

  const smtpHost = Deno.env.get('SMTP_HOST')
  const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '465')
  const smtpUsername = Deno.env.get('SMTP_USERNAME')
  const smtpPassword = Deno.env.get('SMTP_PASSWORD')
  const fromEmail = Deno.env.get('FROM_EMAIL')
  const adminEmail = Deno.env.get('ADMIN_EMAIL')

  console.log('SMTP Configuration (sanitized):', {
    host: smtpHost ? '[set]' : '[missing]',
    port: smtpPort,
    username: smtpUsername ? '[set]' : '[missing]',
    fromEmail: fromEmail ? '[set]' : '[missing]',
    adminEmail: adminEmail ? '[set]' : '[missing]',
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
      tls: true, // Using implicit TLS (465). If your server is on 587, set SMTP_PORT=587 and we can switch to STARTTLS if needed.
      auth: {
        username: smtpUsername,
        password: smtpPassword,
      },
    },
  })

  // Keep HTML on a single line to avoid quoted-printable hard wraps (=20)
  const adminHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Neue Kontaktanfrage</title></head><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333"><h2>Neue Kontaktanfrage eingegangen</h2><h3>Kontaktdaten:</h3><ul><li><strong>Anrede:</strong> ${formData.anrede || 'Nicht angegeben'}</li><li><strong>Vorname:</strong> ${formData.vorname}</li><li><strong>Nachname:</strong> ${formData.nachname}</li><li><strong>E-Mail:</strong> ${formData.email}</li><li><strong>Telefon:</strong> ${formData.telefon}</li></ul><h3>Adresse:</h3><ul><li><strong>Straße:</strong> ${formData.strasse || 'Nicht angegeben'}</li><li><strong>Nummer:</strong> ${formData.nummer || 'Nicht angegeben'}</li><li><strong>PLZ:</strong> ${formData.plz || 'Nicht angegeben'}</li><li><strong>Ort:</strong> ${formData.ort || 'Nicht angegeben'}</li></ul><h3>Nachricht:</h3><p style="background:#f4f4f4;padding:15px;border-radius:5px;margin:0">${formData.nachricht}</p>${formData.propertyId ? `<p><strong>Immobilien-ID:</strong> ${formData.propertyId}</p>` : ''}<hr><p style="margin:0"><small>Anfrage-ID: ${requestId}</small></p></body></html>`
  const adminText = `Neue Kontaktanfrage eingegangen\n\nKontaktdaten:\nAnrede: ${formData.anrede || 'Nicht angegeben'}\nVorname: ${formData.vorname}\nNachname: ${formData.nachname}\nE-Mail: ${formData.email}\nTelefon: ${formData.telefon}\n\nAdresse:\nStraße: ${formData.strasse || 'Nicht angegeben'}\nNummer: ${formData.nummer || 'Nicht angegeben'}\nPLZ: ${formData.plz || 'Nicht angegeben'}\nOrt: ${formData.ort || 'Nicht angegeben'}\n\nNachricht:\n${formData.nachricht}\n${formData.propertyId ? `\nImmobilien-ID: ${formData.propertyId}` : ''}\n\nAnfrage-ID: ${requestId}`

  const userHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Vielen Dank für Ihre Anfrage</title></head><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333"><h2>Vielen Dank für Ihre Anfrage</h2><p>Sehr geehrte Damen und Herren,</p><p>Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich mit Ihnen in Verbindung setzen.</p><p>Mit freundlichen Grüßen<br>Amiel Immobilienverwaltung</p><hr><p style="font-size:12px;color:#666;margin:0">Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.<br>Bei Fragen kontaktieren Sie uns unter: info@amiel-immobilienverwaltung.de</p></body></html>`
  const userText = `Vielen Dank für Ihre Anfrage\n\nSehr geehrte Damen und Herren,\n\nWir haben Ihre Anfrage erhalten und werden uns schnellstmöglich mit Ihnen in Verbindung setzen.\n\nMit freundlichen Grüßen\nAmiel Immobilienverwaltung\n\nDiese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.\nBei Fragen kontaktieren Sie uns unter: info@amiel-immobilienverwaltung.de`

  try {
    console.log('Sending admin email to', adminEmail)
    const adminResult = await client.send({
      from: fromEmail!,
      to: adminEmail!,
      subject: 'Neue Kontaktanfrage von der Website',
      content: adminText,
      html: adminHtml,
      // No custom headers to avoid conflicts; SMTP server sets Date/Message-ID/Return-Path
    })
    console.log('Admin email send result:', adminResult)

    console.log('Sending user email to', formData.email)
    const userResult = await client.send({
      from: fromEmail!,
      to: formData.email,
      subject: 'Vielen Dank für Ihre Anfrage',
      content: userText,
      html: userHtml,
    })
    console.log('User email send result:', userResult)

  } catch (error) {
    console.error('Failed to send emails:', error)
    throw error
  } finally {
    await client.close()
  }
}
