import type { APIRoute } from 'astro';
import { neon } from '@neondatabase/serverless';
// import { Resend } from 'resend';

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

    // Send email notification - TEMPORARILY DISABLED FOR BUILD
    /*
    try {
      const resend = new Resend(import.meta.env.RESEND_API_KEY);
      const pageLabel = data.page ? data.page.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'Unknown';

      await resend.emails.send({
        from: 'Hometown Insurance <notifications@hometowninsurance.com>',
        to: 'service@hometowninsurance.com',
        subject: `New Lead: ${data.full_name} — ${data.insurance_type || 'General'}`,
        html: `
          <h2>New Quote Request</h2>
          <p><strong>Page:</strong> ${pageLabel}${data.form_position ? ` (${data.form_position})` : ''}</p>
          <hr>
          <p><strong>Name:</strong> ${data.full_name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone || '—'}</p>
          <p><strong>Insurance Type:</strong> ${data.insurance_type || '—'}</p>
          <p><strong>Contact Method:</strong> ${data.contact_method || '—'}</p>
          ${data.callback_day ? `<p><strong>Callback Day:</strong> ${data.callback_day}</p>` : ''}
          ${data.callback_time ? `<p><strong>Callback Time:</strong> ${data.callback_time}</p>` : ''}
          ${data.business_name ? `<p><strong>Business:</strong> ${data.business_name}</p>` : ''}
          <p><strong>Message:</strong> ${data.message || '—'}</p>
          <p><strong>How They Heard:</strong> ${data.hear_about || '—'}</p>
          ${data.promo_code ? `<p><strong>Promo Code:</strong> ${data.promo_code}</p>` : ''}
          <hr>
          <p style="color:#888;font-size:12px;">Submitted via hometowninsurance.com</p>
        `
      });
    } catch (emailErr) {
      console.error('Email notification failed (lead still saved):', emailErr);
    }
    */

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
