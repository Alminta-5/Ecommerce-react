import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse the body — handle both trigger format and direct call
    const body = await req.json();

    // Supabase DB triggers send: { type, table, record, old_record }
    // Direct calls might send { record } directly
    const record = body.record ?? body;

    if (!record || !record.name) {
      throw new Error("No record found in request body: " + JSON.stringify(body));
    }

    const { name, email, number, message } = record;

    // --- Send email via Gmail SMTP using fetch to a relay ---
    // We use Deno's built-in fetch with Gmail's OAuth isn't easy,
    // so we use the reliable: smtp via deno std (corrected version below)

    const gmailUser = Deno.env.get("GMAIL_USER")!;
    const gmailPass = Deno.env.get("GMAIL_APP_PASSWORD")!;
    const adminEmail = Deno.env.get("ADMIN_EMAIL")!;

    // Use a working SMTP approach for Deno Edge Functions
    const emailSent = await sendEmailViaGmail({
      gmailUser,
      gmailPass,
      to: adminEmail,
      subject: `New Inquiry from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${number}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    return new Response(
      JSON.stringify({ success: true, emailSent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function sendEmailViaGmail({
  gmailUser,
  gmailPass,
  to,
  subject,
  html,
}: {
  gmailUser: string;
  gmailPass: string;
  to: string;
  subject: string;
  html: string;
}) {
  // Use the correct, working SMTP library for Deno Edge Functions
  const { SmtpClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");

  const client = new SmtpClient({
    connection: {
      hostname: "smtp.gmail.com",
      port: 465,
      tls: true,
      auth: {
        username: gmailUser,
        password: gmailPass,
      },
    },
  });

  await client.send({
    from: gmailUser,
    to: to,
    subject: subject,
    html: html,
  });

  await client.close();
  return true;
}