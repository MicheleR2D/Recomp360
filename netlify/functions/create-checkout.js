// Netlify Function — crea una Stripe Checkout Session per il Guest Pass €17
// Variabile d'ambiente richiesta: STRIPE_SECRET_KEY

import Stripe from 'stripe';

const WEBHOOK_ACQUISTO = 'https://automazione.n8ndevelop.it/webhook/recomp360/acquisto';

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return new Response(
      JSON.stringify({ error: 'Pagamento temporaneamente non disponibile. Contattaci direttamente.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Dati non validi.' }), { status: 400 });
  }

  const { nome, cognome, telefono, email, birthdate, startdate } = body;

  if (!nome || !cognome || !email || !birthdate || !startdate) {
    return new Response(JSON.stringify({ error: 'Dati mancanti.' }), { status: 400 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });

  const origin = req.headers.get('origin') || 'https://recomp360.netlify.app';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: 50, // €0.50 — ⚠️ TEST TEMPORANEO, RIPRISTINARE A 1700
            product_data: {
              name: 'Guest Pass Recomp360',
              description: `7 ingressi in 14 giorni — inizio ${startdate}`,
              images: [`${origin}/images/hero-poster.jpg`],
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        nome,
        cognome,
        telefono,
        email,
        birthdate,
        startdate,
      },
      success_url: `${origin}/grazie?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/?gp=cancelled`,
      locale: 'it',
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Stripe error:', err.message);
    return new Response(
      JSON.stringify({ error: 'Errore Stripe: ' + err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const config = { path: '/api/create-checkout' };
