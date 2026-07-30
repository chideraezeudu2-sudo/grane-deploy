(function () {
  const API_URL = 'https://api.apppulse.ai/api/events';
  const APP_ID = 'YOUR_APP_ID'; // replaced dynamically when the snippet is generated per-user

  // ---------- 1. Always-on Button ----------
  function createFeedbackButton() {
    const btn = document.createElement('button');
    btn.innerHTML = '💬';
    btn.style.cssText =
      'position:fixed;bottom:20px;right:20px;z-index:9999;background:#6C63FF;color:white;border:none;border-radius:50%;width:56px;height:56px;font-size:24px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
    btn.onclick = () => openFeedbackModal('feedback', {}, null);
    document.body.appendChild(btn);
  }

  // ---------- 2. Rage-Click Detector ----------
  let clickCount = 0;
  let clickTimer = null;
  let targetButton = null;

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('button, [role="button"], input[type="submit"]');
    if (!btn) return;

    if (targetButton !== btn) {
      clickCount = 1;
      targetButton = btn;
      clearTimeout(clickTimer);
    } else {
      clickCount++;
      if (clickCount >= 5) {
        const payload = {
          button_text: btn.innerText || 'unknown',
          button_selector: getSelector(btn),
          url: window.location.href,
          click_count: clickCount
        };
        sendEvent('rage_click', payload).then((eventId) => {
          openFeedbackModal('rage_click', { button_text: btn.innerText }, eventId);
        });
        clickCount = 0;
        targetButton = null;
      }
    }

    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => {
      clickCount = 0;
      targetButton = null;
    }, 3000);
  });

  // ---------- 3. Crash Detector ----------
  window.addEventListener('error', function (e) {
    const payload = {
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      stack: e.error?.stack,
      url: window.location.href,
      user_agent: navigator.userAgent
    };
    sendEvent('crash', payload).then((eventId) => {
      openFeedbackModal('crash', { error_message: e.message }, eventId);
    });
  });

  window.addEventListener('unhandledrejection', function (e) {
    const payload = {
      message: e.reason?.message || 'Unhandled Promise Rejection',
      stack: e.reason?.stack,
      url: window.location.href,
      user_agent: navigator.userAgent
    };
    sendEvent('crash', payload).then((eventId) => {
      openFeedbackModal('crash', { error_message: e.reason?.message || 'Promise error' }, eventId);
    });
  });

  // ---------- 4. Long-Pause Tracker ----------
  let pauseTimer = null;
  const CRITICAL_PAGES = ['/checkout', '/payment', '/signup', '/pricing'];

  if (CRITICAL_PAGES.some((path) => window.location.pathname.includes(path))) {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') {
        pauseTimer = setTimeout(() => {
          const payload = { page: window.location.pathname, time_spent: 120, url: window.location.href };
          sendEvent('long_pause', payload).then((eventId) => {
            openFeedbackModal('long_pause', { page: window.location.pathname }, eventId);
          });
        }, 120000);
      } else {
        clearTimeout(pauseTimer);
      }
    });
  }

  // ---------- Core: send event, return event_id ----------
  // FIX from original spec: this now returns the backend-generated event_id
  // so the feedback modal can correctly attach user text to the event that
  // triggered it, instead of referencing an undefined global.
  async function sendEvent(type, data) {
    const payload = {
      app_id: APP_ID,
      type: type,
      data: data,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.event_id || null;
    } catch (err) {
      return null; // silent fail — event send failed, feedback just won't link
    }
  }

  function openFeedbackModal(type, context, eventId) {
    const modal = document.createElement('div');
    modal.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
      <div style="background:white;padding:24px;border-radius:12px;max-width:400px;width:90%;">
        <h3>${getModalTitle(type)}</h3>
        <p>${getModalDescription(type, context)}</p>
        <textarea id="apppulse-feedback" style="width:100%;height:80px;margin:12px 0;padding:8px;border:1px solid #ddd;border-radius:4px;font-family:inherit;resize:vertical;" placeholder="Tell us what happened..."></textarea>
        <button id="apppulse-submit" style="background:#6C63FF;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;">Send Feedback</button>
        <button id="apppulse-close" style="background:transparent;border:none;color:#666;margin-left:8px;cursor:pointer;">Close</button>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('apppulse-submit').onclick = function () {
      const feedback = document.getElementById('apppulse-feedback').value;
      if (feedback && eventId) {
        fetch(`${API_URL}/${eventId}/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback }),
          keepalive: true
        }).catch(() => {});
      }
      modal.remove();
    };

    document.getElementById('apppulse-close').onclick = () => modal.remove();
  }

  function getModalTitle(type) {
    const titles = {
      feedback: 'Send Feedback',
      rage_click: 'Having trouble?',
      crash: 'Oops! Something went wrong',
      long_pause: 'Need help?'
    };
    return titles[type] || 'Send Feedback';
  }

  function getModalDescription(type, context) {
    const descriptions = {
      feedback: 'Tell us what you think about this page.',
      rage_click: `We noticed you clicked "${context?.button_text || 'the button'}" multiple times. What's happening?`,
      crash: `We detected an error: ${context?.error_message || 'Something broke'}. What were you doing?`,
      long_pause: `You've been on this page for a while. Are you stuck? Tell us what's wrong.`
    };
    return descriptions[type] || 'Tell us what happened.';
  }

  function getSelector(el) {
    if (el.id) return '#' + el.id;
    if (el.className) return '.' + String(el.className).split(' ')[0];
    return el.tagName.toLowerCase();
  }

  createFeedbackButton();
  console.log('🔍 AppPulse AI monitoring active');
})();
