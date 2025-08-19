import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContactFormData {
  propertyId?: string;
  anrede?: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  strasse: string;
  nummer: string;
  plz: string;
  ort: string;
  nachricht: string;
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

    const formData: ContactFormData = await req.json()

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

    // Send emails using SMTP
    try {
      await Promise.all([
        sendAdminNotification(formData),
        sendUserConfirmation(formData)
      ]);
      console.log('Both emails sent successfully');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if emails fail - the contact is already saved
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

async function sendAdminNotification(formData: ContactFormData) {
  const subject = `Neue Anfrage von ${formData.vorname} ${formData.nachname}`;
  
  const text = `
====================================
NEUE KONTAKTANFRAGE
====================================

Name: ${formData.vorname} ${formData.nachname}
${formData.anrede ? `Anrede: ${formData.anrede}` : ''}
E-Mail: ${formData.email}
Telefon: ${formData.telefon}

Adresse:
${formData.strasse} ${formData.nummer}
${formData.plz} ${formData.ort}

${formData.propertyId ? `Immobilien-ID: ${formData.propertyId}` : ''}

Nachricht:
${formData.nachricht}

====================================
Erhalten am: ${new Date().toLocaleString('de-DE')}
====================================
  `.trim();

  await sendEmailSMTP({
    to: [Deno.env.get('ADMIN_EMAIL') || 'info@amiel-immobilienverwaltung.de'],
    subject,
    text,
    replyTo: formData.email
  });
}

async function sendUserConfirmation(formData: ContactFormData) {
  const subject = "Vielen Dank für Ihre Anfrage";
  
  const text = `
Sehr geehrte Damen und Herren,

Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich mit Ihnen in Verbindung setzen.

Mit freundlichen Grüßen
Amiel Immobilienverwaltung

---

Mit freundlichen Grüßen
Amiel Immobilienverwaltung

Amiel Immobilienverwaltung GmbH
Leuchtenbergring 54
81677 München
Telefon: +49 89 123 456 789
E-Mail: info@amiel-immobilienverwaltung.de

Handelsregister: Amtsgericht München, HRB 90221
USt-IdNr.: DE9741089

Hinweis: Diese E-Mail und alle Anhänge sind vertraulich und ausschließlich für den bezeichneten Adressaten bestimmt.
  `.trim();

  await sendEmailSMTP({
    to: [formData.email],
    subject,
    text
  });
}

async function sendEmailSMTP(emailData: { to: string[]; subject: string; text: string; replyTo?: string }) {
  console.log('Connecting to SMTP server...');
  
  const smtpHost = Deno.env.get('SMTP_HOST') || '';
  const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587');
  const smtpUser = Deno.env.get('SMTP_USERNAME') || '';
  const smtpPass = Deno.env.get('SMTP_PASSWORD') || '';
  const fromEmail = Deno.env.get('FROM_EMAIL') || 'info@amiel-immobilienverwaltung.de';

  // Create SMTP connection
  const conn = smtpPort === 465 
    ? await Deno.connectTls({ hostname: smtpHost, port: smtpPort })
    : await Deno.connect({ hostname: smtpHost, port: smtpPort });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  async function sendCommand(command: string): Promise<string> {
    if (command) {
      console.log('SMTP Command:', command.replace(smtpPass, '***PASSWORD***'));
      await conn.write(encoder.encode(command + '\r\n'));
    }
    const buffer = new Uint8Array(1024);
    const bytesRead = await conn.read(buffer);
    const response = decoder.decode(buffer.subarray(0, bytesRead || 0));
    console.log('SMTP Response:', response.trim());
    return response;
  }

  try {
    // Read greeting
    let response = await sendCommand('');
    
    // EHLO
    response = await sendCommand(`EHLO ${smtpHost}`);
    
    // STARTTLS for port 587
    if (smtpPort === 587) {
      response = await sendCommand('STARTTLS');
      // Upgrade to TLS
      const tlsConn = await Deno.startTls(conn, { hostname: smtpHost });
      conn.close();
      // Continue with TLS connection
      response = await sendCommand(`EHLO ${smtpHost}`);
    }
    
    // AUTH LOGIN
    response = await sendCommand('AUTH LOGIN');
    
    // Send username (base64 encoded)
    const username = btoa(smtpUser);
    response = await sendCommand(username);
    
    // Send password (base64 encoded)
    const password = btoa(smtpPass);
    response = await sendCommand(password);
    
    // MAIL FROM
    response = await sendCommand(`MAIL FROM:<${fromEmail}>`);
    
    // Send to each recipient
    for (const recipient of emailData.to) {
      response = await sendCommand(`RCPT TO:<${recipient}>`);
    }
    
    // DATA
    response = await sendCommand('DATA');
    
    // Generate email headers
    const messageId = `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@amiel-immobilienverwaltung.de>`;
    const currentDate = new Date().toUTCString();
    
    const emailContent = [
      `From: Amiel Immobilienverwaltung <${fromEmail}>`,
      `To: ${emailData.to.join(', ')}`,
      `Reply-To: ${emailData.replyTo || fromEmail}`,
      `Message-ID: ${messageId}`,
      `Date: ${currentDate}`,
      `Subject: ${emailData.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      emailData.text,
      '.'
    ].join('\r\n');

    response = await sendCommand(emailContent);
    
    // QUIT
    await sendCommand('QUIT');

    console.log('SMTP Email sent successfully');

  } finally {
    conn.close();
  }
}