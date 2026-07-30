import express from 'express';
import Stripe from 'stripe';
import { supabaseAdmin } from '../db/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { getPlanLimits } from '../services/planLimits.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// POST /api/billing/create-checkout — AUTHENTICATED
// Body: { plan: 'basic' | 'pro' }
router.post('/create-checkout', requireAuth, async (req, res) => {
  const { plan } = req.body;
  if (!['basic', 'pro'].includes(plan)) {
    return res.status(400).json({ error: 'Plan must be "basic" or "pro"' });
  }

  const limits = getPlanLimits(plan);
  if (!limits.priceId) {
    return res.status(500).json({ error: 'Stripe price ID not configured for this plan' });
  }

  const { data: userRow } = await supabaseAdmin
    .from('users')
    .select('email, stripe_customer_id')
    .eq('id', req.user.id)
    .single();

  let customerId = userRow.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userRow.email,
      metadata: { user_id: req.user.id }
    });
    customerId = customer.id;
    await supabaseAdmin.from('users').update({ stripe_customer_id: customerId }).eq('id', req.user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: limits.priceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.FRONTEND_URL}/dashboard?checkout=cancelled`,
    metadata: { user_id: req.user.id, plan }
  });

  return res.json({ checkout_url: session.url });
});

// POST /api/billing/portal — AUTHENTICATED
router.post('/portal', requireAuth, async (req, res) => {
  const { data: userRow } = await supabaseAdmin
    .from('users')
    .select('stripe_customer_id')
    .eq('id', req.user.id)
    .single();

  if (!userRow.stripe_customer_id) {
    return res.status(400).json({ error: 'No billing account found for this user' });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: userRow.stripe_customer_id,
    return_url: `${process.env.FRONTEND_URL}/dashboard`
  });

  return res.json({ portal_url: session.url });
});

/**
 * POST /api/billing/webhook
 * PUBLIC (Stripe-signed) — must use raw body parsing, mounted BEFORE
 * express.json() in server.js for this specific route.
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata.user_id;
      const plan = session.metadata.plan;
      await supabaseAdmin
        .from('users')
        .update({
          plan,
          stripe_subscription_id: session.subscription,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', userId);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      await supabaseAdmin
        .from('users')
        .update({ plan: 'free' })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }

    case 'invoice.payment_failed': {
      // Consider: notify user, flag account, or downgrade after N failures.
      // Left as a hook for future dunning logic — not required for MVP.
      console.warn('Payment failed for invoice', event.data.object.id);
      break;
    }

    default:
      break;
  }

  return res.json({ received: true });
});

export default router;
