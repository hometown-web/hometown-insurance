import type { APIRoute } from 'astro';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    if (!data.email || !data.full_name) {
      return new Response(JSON.stringify({ success: false, error: 'Name and email are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const sql = neon(import.meta.env.DATABASE_URL);

    await sql`INSERT INTO leads (
      full_name, email, phone, insurance_type,
      contact_method, callback_day, callback_time,
      hear_about, promo_code, message,
      business_name, page, form_position
    ) VALUES (
      ${data.full_name}, ${data.email}, ${data.phone || ''},
      ${data.insurance_type || ''},
      ${data.contact_method || ''}, ${data.callback_day || ''}, ${data.callback_time || ''},
      ${data.hear_about || ''}, ${data.promo_code || ''},
      ${data.message || ''}, ${data.business_name || ''},
      ${data.page || ''}, ${data.form_position || ''}
    )`;

    // Send email notification via Resend
    try {
      const resend = new Resend(import.meta.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Hometown Insurance <noreply@hometowninsurance.com>',
        to: 'service@hometowninsurance.com',
        subject: `New Quote Request from ${data.full_name}`,
        html: `
          <h2>New Quote Request</h2>
          <p><strong>Name:</strong> ${data.full_name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
          <p><strong>Insurance Type:</strong> ${data.insurance_type || 'N/A'}</p>
          <p><strong>Contact Method:</strong> ${data.contact_method || 'N/A'}</p>
          ${data.contact_method === 'Callback' ? `<p><strong>Callback Day:</strong> ${data.callback_day || 'N/A'}</p><p><strong>Callback Time:</strong> ${data.callback_time || 'N/A'}</p>` : ''}
          <p><strong>How They Heard About Us:</strong> ${data.hear_about || 'N/A'}</p>
          <p><strong>Promo Code:</strong> ${data.promo_code || 'N/A'}</p>
          <p><strong>Message:</strong> ${data.message || 'N/A'}</p>
          <p><strong>Page:</strong> ${data.page || 'N/A'}</p>
        `
      });
    } catch (emailErr) {
      console.error('Resend email error:', emailErr);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Lead submission error:', err);
    return new Response(JSON.stringify({ success: false, error: 'Server error. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
