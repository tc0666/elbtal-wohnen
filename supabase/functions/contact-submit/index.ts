import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

console.log('Edge function loaded - contact-submit with SMTP');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to encode email headers with non-ASCII characters (RFC 2047)
function encodeEmailHeader(text: string): string {
  // Check if the text contains only ASCII characters
  if (/^[\x00-\x7F]*$/.test(text)) {
    return text; // Return as-is if only ASCII
  }
  
  // Encode as UTF-8 Base64 for non-ASCII characters
  const utf8Bytes = new TextEncoder().encode(text);
  const base64 = btoa(String.fromCharCode(...utf8Bytes));
  return `=?UTF-8?B?${base64}?=`;
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

const handler = async (req: Request): Promise<Response> => {
  console.log('=== HANDLER STARTED ===');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    console.log('=== PROCESSING REQUEST ===');
    const formData: ContactFormData = await req.json();
    console.log('Form data received:', JSON.stringify(formData, null, 2));
    
    // Validate required fields
    if (!formData.vorname || !formData.nachname || !formData.email || !formData.nachricht) {
      console.log('Validation failed - missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: vorname, nachname, email, and nachricht' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('=== SAVING TO DATABASE ===');
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store the inquiry in the database
    const { data: request, error: dbError } = await supabase
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
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to store inquiry' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('=== DATABASE SAVE SUCCESS ===');
    console.log('Contact request saved with ID:', request.id);

    // Send email notifications using SMTP
    try {
      console.log('=== STARTING SMTP EMAIL SEND ===');
      
      await Promise.all([
        sendAdminNotification(formData),
        sendUserConfirmation(formData)
      ]);
      
      console.log('=== BOTH EMAILS SENT SUCCESSFULLY ===');
    } catch (emailError) {
      console.error('=== EMAIL ERROR ===');
      console.error('Email sending failed:', emailError);
      console.error('Error message:', emailError.message);
      // Don't fail the entire request if email fails - inquiry is already stored
    }

    console.log('=== RETURNING SUCCESS RESPONSE ===');
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Ihre Anfrage wurde erfolgreich übermittelt.',
        id: request.id 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('=== MAIN ERROR ===');
    console.error('Error in contact-submit function:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);

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
  const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '465');
  const smtpUser = Deno.env.get('SMTP_USERNAME') || '';
  const smtpPass = Deno.env.get('SMTP_PASSWORD') || '';
  const fromEmail = Deno.env.get('FROM_EMAIL') || 'info@amiel-immobilienverwaltung.de';

  console.log('SMTP Config:', { host: smtpHost, port: smtpPort, user: smtpUser });

  // Create SMTP connection - use TLS for port 465
  const conn = await Deno.connectTls({
    hostname: smtpHost,
    port: smtpPort,
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Helper function to send command and read response
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
    
    // Generate proper email headers for better deliverability
    const messageId = `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@amiel-immobilienverwaltung.de>`;
    const currentDate = new Date().toUTCString();
    
    // Encode subject to handle German characters properly
    const encodedSubject = encodeEmailHeader(emailData.subject);
    
    const emailContent = [
      `From: Amiel Immobilienverwaltung <${fromEmail}>`,
      `To: ${emailData.to.join(', ')}`,
      `Reply-To: ${emailData.replyTo || fromEmail}`,
      `Return-Path: ${fromEmail}`,
      `Message-ID: ${messageId}`,
      `Date: ${currentDate}`,
      `Subject: ${encodedSubject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      'X-Mailer: Amiel Immobilienverwaltung Contact System',
      'X-Priority: 3',
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