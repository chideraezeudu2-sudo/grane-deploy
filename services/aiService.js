import Groq from 'groq-sdk';
import { supabaseAdmin } from '../db/supabase.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const AI_CALLS_PER_HOUR_LIMIT = 50;
const MAX_TOKENS = 150; // hard cap — do not rely on prompt instructions alone for length control

/**
 * Checks whether this app_id is within its hourly AI-call budget.
 * Protects against cost spikes from crash loops (e.g. an error handler
 * that itself throws, triggering repeated crash events in a tight loop).
 */
async function isWithinAiBudget(appId) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count, error } = await supabaseAdmin
    .from('ai_call_log')
    .select('id', { count: 'exact', head: true })
    .eq('app_id', appId)
    .gte('called_at', oneHourAgo);

  if (error) {
    // Fail closed on error: skip AI rather than risk unbounded spend.
    console.error('AI budget check failed:', error.message);
    return false;
  }

  return (count || 0) < AI_CALLS_PER_HOUR_LIMIT;
}

async function logAiCall(userId, appId) {
  await supabaseAdmin.from('ai_call_log').insert({ user_id: userId, app_id: appId });
}

async function callGroq(prompt) {
  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL, // confirm current model name at build/deploy time
    messages: [{ role: 'user', content: prompt }],
    max_tokens: MAX_TOKENS,
    temperature: 0.3
  });
  return completion.choices[0]?.message?.content?.trim() || '';
}

async function translateCrash({ errorMessage, stackTrace, browserInfo, pageUrl }) {
  const prompt = `You are AppPulse AI, a technical assistant for software developers.
Translate the following JavaScript error into plain English for a developer:

Error: ${errorMessage}
Stack trace: ${stackTrace || 'not available'}
Browser: ${browserInfo}
URL: ${pageUrl}

Explain what happened, why it likely happened, and give a brief recommendation for fixing it.
Keep it under 100 words. Be specific and technical but clear.`;
  return callGroq(prompt);
}

async function translateUxFriction({ pageUrl, timeSpent, buttonText, clicks }) {
  const prompt = `You are AppPulse AI, a product intelligence assistant.
A user was stuck on ${pageUrl} for ${timeSpent} seconds and rage-clicked on the ${buttonText} button ${clicks} times.

Explain why this user might be frustrated and what the developer should investigate.
Keep it under 100 words.`;
  return callGroq(prompt);
}

async function analyzeFakeDoorSentiment({ featureName, totalClicks, feedbackTexts }) {
  const prompt = `You are AppPulse AI, a product roadmap assistant.
We tested a feature called "${featureName}" with ${totalClicks} users.
User feedback: ${feedbackTexts.join(' | ') || 'no written feedback provided'}

Based on this data, give a priority score from 0-100 (100 = build immediately).
Also provide a one-sentence summary of the sentiment.
Respond in this exact format:
SCORE: <number>
SUMMARY: <one sentence>`;

  const raw = await callGroq(prompt);
  const scoreMatch = raw.match(/SCORE:\s*(\d+)/i);
  const summaryMatch = raw.match(/SUMMARY:\s*(.+)/i);

  return {
    score: scoreMatch ? parseInt(scoreMatch[1], 10) : null,
    summary: summaryMatch ? summaryMatch[1].trim() : raw
  };
}

export {
  isWithinAiBudget,
  logAiCall,
  translateCrash,
  translateUxFriction,
  analyzeFakeDoorSentiment
};
