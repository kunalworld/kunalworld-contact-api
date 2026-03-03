export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (url.pathname === '/api/prices' && request.method === 'GET') {
      try {
        const [metalsResponse, forexResponse] = await Promise.all([
          fetch('https://api.metals.live/v1/spot'),
          fetch('https://open.er-api.com/v6/latest/USD')
        ]);

        const metalsData = await metalsResponse.json();
        const forexData = await forexResponse.json();

        const gold = metalsData[0]?.price || 2024.50;
        const silver = metalsData[1]?.price || 23.45;
        const eurusd = forexData.rates?.EUR ? (1 / forexData.rates.EUR) : 1.0856;

        return new Response(
          JSON.stringify({
            gold: parseFloat(gold.toFixed(2)),
            silver: parseFloat(silver.toFixed(2)),
            eurusd: parseFloat(eurusd.toFixed(4))
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            gold: 2024.50,
            silver: 23.45,
            eurusd: 1.0856
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        const body = await request.json();

        if (!body.name || !body.email || !body.message) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
            }
          );
        }

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'contact@kunalworld.in',
            to: env.CONTACT_EMAIL || 'contact@kunalworld.in',
            subject: `New Contact Form Submission from ${body.name}`,
            html: `
              <h2>New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${body.name}</p>
              <p><strong>Email:</strong> ${body.email}</p>
              <p><strong>Message:</strong></p>
              <p>${body.message}</p>
            `,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send email');
        }

        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to send message' }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};
