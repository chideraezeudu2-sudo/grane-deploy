// Basic PII redaction for user-submitted feedback text.
// Not exhaustive — a determined user can still leak PII in free text.
// This covers the common cases: emails, phone numbers, and simple name patterns.

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(\+?\d{1,2}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;

function redactPii(text) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(EMAIL_RE, '[redacted-email]')
    .replace(PHONE_RE, '[redacted-phone]');
}

export { redactPii };
