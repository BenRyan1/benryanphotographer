// ============================================================
// Ben Ryan Photography — Limited Edition Inquiry Worker
// Deploy to: Cloudflare Workers
// Name suggestion: benryan-photo-inquiry
// ============================================================
// SETUP: Set these environment variables in Cloudflare Workers:
//   BREVO_API_KEY  = your Brevo API key
//   TO_EMAIL       = benryanphotographer@gmail.com
//   TO_NAME        = Ben Ryan
// ============================================================

export default {
  async fetch(request, env) {

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return corsResponse('', 204);
    }

    // Only accept POST
    if (request.method !== 'POST') {
      return corsResponse(JSON.stringify({ error: 'Method not allowed' }), 405);
    }

    try {
      const data = await request.json();

      // Build the email HTML
      const emailHtml = `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a">
          <div style="background:#2a4d6f;padding:28px 32px">
            <h1 style="color:#F4D03F;font-size:20px;margin:0;letter-spacing:2px;font-weight:400">
              BEN RYAN PHOTOGRAPHY
            </h1>
            <p style="color:#7a9ab8;margin:6px 0 0;font-size:13px;letter-spacing:1px">
              NEW ACQUISITION INQUIRY
            </p>
          </div>
          
          <div style="background:#f8f5f0;padding:28px 32px;border-left:3px solid #F4D03F">
            <h2 style="color:#2a4d6f;font-size:16px;margin:0 0 4px;font-weight:600">
              ${escHtml(data.title || 'Unknown Work')}
            </h2>
            <p style="color:#666;font-size:13px;margin:0 0 20px">
              ${escHtml(data.series || '')}
            </p>
            
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr style="border-bottom:1px solid #ddd">
                <td style="padding:10px 0;color:#888;width:140px">Name</td>
                <td style="padding:10px 0;font-weight:600">${escHtml(data.firstName || '')} ${escHtml(data.lastName || '')}</td>
              </tr>
              <tr style="border-bottom:1px solid #ddd">
                <td style="padding:10px 0;color:#888">Email</td>
                <td style="padding:10px 0">
                  <a href="mailto:${escHtml(data.email || '')}" style="color:#2a4d6f">
                    ${escHtml(data.email || '')}
                  </a>
                </td>
              </tr>
              <tr style="border-bottom:1px solid #ddd">
                <td style="padding:10px 0;color:#888">Phone</td>
                <td style="padding:10px 0">${escHtml(data.phone || 'Not provided')}</td>
              </tr>
              <tr style="border-bottom:1px solid #ddd">
                <td style="padding:10px 0;color:#888">Print Size</td>
                <td style="padding:10px 0;color:#2a4d6f;font-weight:600">${escHtml(data.size || '')}</td>
              </tr>
              <tr style="border-bottom:1px solid #ddd">
                <td style="padding:10px 0;color:#888">Framing</td>
                <td style="padding:10px 0">${escHtml(data.framing || 'None')}</td>
              </tr>
              <tr style="border-bottom:1px solid #ddd">
                <td style="padding:10px 0;color:#888">Est. Total</td>
                <td style="padding:10px 0;font-size:18px;font-weight:700;color:#2a4d6f">
                  ${escHtml(data.total || '')}
                </td>
              </tr>
              ${data.message ? `
              <tr>
                <td style="padding:10px 0;color:#888;vertical-align:top">Message</td>
                <td style="padding:10px 0;font-style:italic">${escHtml(data.message)}</td>
              </tr>` : ''}
            </table>
          </div>

          <div style="background:#2a4d6f;padding:20px 32px">
            <p style="color:#F4D03F;margin:0;font-size:13px;letter-spacing:1px">
              NEXT STEP
            </p>
            <p style="color:#ddd;margin:8px 0 0;font-size:14px">
              Reply to this email to confirm availability, then send a Stripe payment link for 
              <strong style="color:white">${escHtml(data.total || 'the agreed amount')}</strong>.
            </p>
            <p style="color:#7a9ab8;margin:12px 0 0;font-size:12px">
              Sent from benryanphotographer.com · ${new Date().toLocaleString('en-US', {timeZone:'America/Los_Angeles'})}
            </p>
          </div>
        </div>
      `;

      // Send via Brevo
      const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: {
            name: 'Ben Ryan Photography',
            email: 'noreply@benryanphotographer.com'
          },
          to: [{
            email: env.TO_EMAIL,
            name: env.TO_NAME
          }],
          replyTo: {
            email: data.email,
            name: `${data.firstName} ${data.lastName}`
          },
          subject: `New Inquiry: ${data.title} — ${data.total}`,
          htmlContent: emailHtml,
        }),
      });

      if (!brevoRes.ok) {
        const err = await brevoRes.text();
        console.error('Brevo error:', err);
        return corsResponse(JSON.stringify({ error: 'Email failed' }), 500);
      }

      return corsResponse(JSON.stringify({ ok: true }), 200);

    } catch (err) {
      console.error('Worker error:', err);
      return corsResponse(JSON.stringify({ error: 'Server error' }), 500);
    }
  }
};

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function corsResponse(body, status) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://benryanphotographer.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
