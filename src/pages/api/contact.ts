import type { APIRoute } from 'astro';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    if (!data.email || !data.first_name || !data.last_name) {
      return new Response(JSON.stringify({ success: false, error: 'Name and email are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const sql = neon(import.meta.env.DATABASE_URL);

    await sql`INSERT INTO contacts (
      first_name, last_name, email, phone, help_type, help_other, message
    ) VALUES (
      ${data.first_name}, ${data.last_name}, ${data.email},
      ${data.phone || ''}, ${data.help_type || ''}, ${data.help_other || ''}, ${data.message || ''}
    )`;

    // Send email notification
    try {
      const resend = new Resend(import.meta.env.RESEND_API_KEY);

      await resend.emails.send({
        from: 'Hometown Insurance <notifications@hometowninsurance.com>',
        to: 'service@hometowninsurance.com',
        subject: `New Contact: ${data.first_name} ${data.last_name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <hr>
          <p><strong>Name:</strong> ${data.first_name} ${data.last_name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone || '—'}</p>
          <p><strong>How Can We Help:</strong> ${data.help_type || '—'}${data.help_other ? ` (${data.help_other})` : ''}</p>
          <p><strong>Message:</strong> ${data.message || '—'}</p>
          <hr>
          <p style="color:#888;font-size:12px;">Submitted via hometowninsurance.com contact page</p>
        `
      });
    } catch (emailErr) {
      console.error('Email notification failed (contact still saved):', emailErr);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Contact submission error:', err);
    return new Response(JSON.stringify({ success: false, error: 'Server error. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
