import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { SMTPClient } from "https://deno.land/x/denomailer/mod.ts";


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

    // SMTP email sending (optional, controlled by env). Fails are logged but do not affect response.
    let userEmailSent = false
    let adminEmailSent = false

    try {
      const SMTP_ENABLED = (Deno.env.get('SMTP_ENABLED') ?? 'false') === 'true'
      if (SMTP_ENABLED) {
        const hostname = Deno.env.get('SMTP_HOST') ?? ''
        const port = Number(Deno.env.get('SMTP_PORT') ?? '465')
        const username = Deno.env.get('SMTP_USERNAME') ?? ''
        const password = Deno.env.get('SMTP_PASSWORD') ?? ''
        const fromEnv = Deno.env.get('SMTP_FROM') ?? ''
        const from = fromEnv.includes('@')
          ? fromEnv
          : fromEnv
            ? `${fromEnv} <${username}>`
            : `Amiel Immobilienverwaltung <${username}>`
        const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? ''
        const secureEnv = (Deno.env.get('SMTP_SECURE') ?? '').toLowerCase()
        const useTLS = secureEnv === 'true' || port === 465

        if (!hostname || !username || !password || !from) {
          console.warn('SMTP is enabled but missing required config (HOST/USERNAME/PASSWORD/FROM).')
        } else {
          const client = new SMTPClient({
            connection: {
              hostname,
              port,
              tls: useTLS,
              auth: { username, password },
            },
          })

          // Send confirmation to user
          try {
            const subject = 'Vielen Dank für Ihre Anfrage'
            const companySig = `Mit freundlichen Grüßen\nAmiel Immobilienverwaltung\n\nAmiel Immobilienverwaltung GmbH\nLeuchtenbergring 54\n81677 München\nTelefon: +49 89 123 456 789\nE-Mail: info@amiel-immobilienverwaltung.de\n\nHandelsregister: Amtsgericht München, HRB 90221\nUSt-IdNr.: DE9741089\n\nHinweis: Diese E-Mail und alle Anhänge sind vertraulich und ausschließlich für den bezeichneten Adressaten bestimmt.`
            const plain = `Sehr geehrte Damen und Herren,\n\nWir haben Ihre Anfrage erhalten und werden uns schnellstmöglich mit Ihnen in Verbindung setzen.\n\n${companySig}`
            const html = `<p>Sehr geehrte Damen und Herren,</p>
<p>Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich mit Ihnen in Verbindung setzen.</p>
<br/>
<p>Mit freundlichen Grüßen<br/>Amiel Immobilienverwaltung</p>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;"/>
<p><strong>Amiel Immobilienverwaltung GmbH</strong><br/>
Leuchtenbergring 54<br/>
81677 München<br/>
Telefon: +49 89 123 456 789<br/>
E-Mail: info@amiel-immobilienverwaltung.de</p>
<p>Handelsregister: Amtsgericht München, HRB 90221<br/>
USt-IdNr.: DE9741089</p>
<p style="color:#6b7280;font-size:12px;">Hinweis: Diese E-Mail und alle Anhänge sind vertraulich und ausschließlich für den bezeichneten Adressaten bestimmt.</p>`

            const messageId = `<contact-${request.id}@amiel-immobilienverwaltung.de>`
            const now = new Date().toUTCString()

            await client.send({
              from,
              to: formData.email,
              subject,
              content: plain,
              html,
              replyTo: from,
              date: now,
              headers: {
                "Message-ID": messageId,
                "Return-Path": from,
                "X-Mailer": "Elbtal-Wohnen/1.0 (Supabase Edge + denomailer)",
              },
            })
            userEmailSent = true
          } catch (err) {
            console.error('Failed to send user confirmation email:', err)
          }

          // Send notification to admin
          if (adminEmail) {
            try {
              const subject = 'Neue Kontaktanfrage eingegangen'
              const plain = `Neue Kontaktanfrage:

Name: ${formData.vorname} ${formData.nachname}
E-Mail: ${formData.email}
Telefon: ${formData.telefon}
Property ID: ${formData.propertyId ?? '-'}
Nachricht:
${formData.nachricht}

Request ID: ${request.id}`
              const messageId = `<contact-admin-${request.id}@amiel-immobilienverwaltung.de>`
              const now = new Date().toUTCString()

              await client.send({
                from,
                to: adminEmail,
                subject,
                content: plain,
                html: plain.split('\n').join('<br/>'),
                replyTo: formData.email,
                date: now,
                headers: {
                  "Message-ID": messageId,
                  "Return-Path": from,
                  "X-Mailer": "Elbtal-Wohnen/1.0 (Supabase Edge + denomailer)",
                },
              })
              adminEmailSent = true
            } catch (err) {
              console.error('Failed to send admin notification email:', err)
            }
          }

          await client.close()
        }
      }
    } catch (emailErr) {
      console.error('Email subsystem error:', emailErr)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Ihre Anfrage wurde erfolgreich übermittelt.',
        requestId: request.id,
        email: { user: userEmailSent, admin: adminEmailSent },
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