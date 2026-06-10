// Netlify Function — recupera la Stripe Checkout Session e notifica n8n
// Chiamata da grazie.astro con ?session_id=...
// Variabile d'ambiente richiesta: STRIPE_SECRET_KEY

import Stripe from 'stripe';

const WEBHOOK_ACQUISTO = 'https://automazione.n8ndevelop.it/webhook/recomp360/acquisto';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return new Response(
      JSON.stringify({ error: 'Stripe non configurato.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Dati non validi.' }), { status: 400 });
  }

  const { session_id } = body;
  if (!session_id) {
    return new Response(JSON.stringify({ error: 'session_id mancante.' }), { status: 400 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Verifica che il pagamento sia effettivamente completato
    if (session.payment_status !== 'paid') {
      return new Response(
        JSON.stringify({ ok: false, reason: 'payment_not_completed' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { nome, cognome, telefono, email, birthdate, startdate } = session.metadata || {};

    const payload = {
      esito:      'acquisto_completato',
      session_id: session.id,
      importo:    session.amount_total / 100,
      valuta:     session.currency?.toUpperCase(),
      nome,
      cognome,
      telefono,
      email,
      birthdate,
      startdate,
      timestamp:  new Date().toISOString(),
    };

    // Notifica n8n — fire & forget
    fetch(WEBHOOK_ACQUISTO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});

    return new Response(
      JSON.stringify({ ok: true, nome, cognome, email, startdate }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Stripe retrieve error:', err.message);
    return new Response(
      JSON.stringify({ error: 'Errore nel recupero della sessione.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const config = { path: '/api/checkout-success' };
