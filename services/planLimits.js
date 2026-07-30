// Central source of truth for plan gating.
// Update this file, and only this file, when pricing/limits change.

const PLAN_LIMITS = {
  free: {
    eventsPerMonth: 500,
    retentionDays: 7,
    aiCrashTranslation: false,
    aiUxTranslation: false,
    fakeDoors: { max: 1, aiSentiment: false },
    priceId: null
  },
  basic: {
    eventsPerMonth: 5000,
    retentionDays: 30,
    aiCrashTranslation: true,
    aiUxTranslation: false,
    fakeDoors: { max: 3, aiSentiment: true },
    priceId: process.env.STRIPE_PRICE_BASIC
  },
  pro: {
    eventsPerMonth: 25000,
    retentionDays: 90,
    aiCrashTranslation: true,
    aiUxTranslation: true,
    fakeDoors: { max: Infinity, aiSentiment: true },
    priceId: process.env.STRIPE_PRICE_PRO
  }
};

function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

function canUseAiForEventType(plan, eventType) {
  const limits = getPlanLimits(plan);
  if (eventType === 'crash') return limits.aiCrashTranslation;
  if (eventType === 'rage_click' || eventType === 'long_pause') return limits.aiUxTranslation;
  return false;
}

export { PLAN_LIMITS, getPlanLimits, canUseAiForEventType };
