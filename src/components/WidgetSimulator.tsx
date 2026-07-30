import React, { useState } from "react";
import { AlertCircle, MousePointerClick, Timer, MessageSquare, Check, Sparkles } from "lucide-react";
import { api } from "../services/api";

interface WidgetSimulatorProps {
  appId: string;
  onEventSent?: () => void;
}

export const WidgetSimulator: React.FC<WidgetSimulatorProps> = ({ appId, onEventSent }) => {
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState("");

  const triggerCrash = async () => {
    setLoading(true);
    setLastMessage(null);
    try {
      const res = await api.sendPublicEvent(
        appId,
        "crash",
        {
          message: "Uncaught TypeError: Cannot read property 'stripeToken' of undefined",
          stack: "TypeError: Cannot read property 'stripeToken' of undefined at CheckoutForm.handleSubmit (checkout.js:142:21)",
          userAgent: navigator.userAgent,
        },
        "https://customer-app.com/checkout"
      );
      setLastMessage("Crash event generated! AI diagnosis is running...");
      if (res.event_id) {
        setCurrentEventId(res.event_id);
        setShowFeedbackModal(true);
      }
      if (onEventSent) onEventSent();
    } catch (e: any) {
      setLastMessage("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerRageClick = async () => {
    setLoading(true);
    setLastMessage(null);
    try {
      const res = await api.sendPublicEvent(
        appId,
        "rage_click",
        {
          targetElement: "button#apply-coupon-discount",
          clickCount: 6,
          timeWindowMs: 1200,
        },
        "https://customer-app.com/pricing"
      );
      setLastMessage("Rage click event recorded! AI analyzing friction point...");
      if (res.event_id) {
        setCurrentEventId(res.event_id);
        setShowFeedbackModal(true);
      }
      if (onEventSent) onEventSent();
    } catch (e: any) {
      setLastMessage("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerLongPause = async () => {
    setLoading(true);
    setLastMessage(null);
    try {
      await api.sendPublicEvent(
        appId,
        "long_pause",
        {
          idleSeconds: 38,
          focusedInput: "input#team-workspace-slug",
        },
        "https://customer-app.com/signup"
      );
      setLastMessage("38s long pause event captured on /signup page!");
      if (onEventSent) onEventSent();
    } catch (e: any) {
      setLastMessage("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (!currentEventId || !feedbackInput.trim()) return;
    try {
      await api.sendEventFeedback(currentEventId, feedbackInput);
      setLastMessage("Feedback recorded with automatic PII redaction!");
      setShowFeedbackModal(false);
      setFeedbackInput("");
      if (onEventSent) onEventSent();
    } catch (e: any) {
      alert("Error sending feedback: " + e.message);
    }
  };

  return (
    <div className="card-dark border border-white/15 bg-[#0c0c0e] shadow-2xl my-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <h3 className="font-figtree font-medium text-base text-[#E0D8D0] flex items-center gap-2">
            Interactive Widget Test Sandbox
          </h3>
        </div>
        <span className="text-[10px] font-sans uppercase tracking-[0.15em] px-3 py-1 bg-white/10 text-[#E0D8D0] rounded-full border border-white/15">
          App ID: {appId.slice(0, 12)}...
        </span>
      </div>

      <p className="text-xs font-figtree text-[#9e968d] mb-6">
        Simulate user behavior in your app to test how Grane captures events, prompts for feedback, and generates plain-English diagnoses.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={triggerCrash}
          disabled={loading}
          className="bg-[#000000] hover:bg-white/10 text-[#E0D8D0] border border-white/15 rounded-xl p-3.5 text-left transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-1">
            <AlertCircle className="w-4 h-4" />
            Simulate JS Crash
          </div>
          <span className="text-[11px] text-[#9e968d]">Trigger null pointer on /checkout</span>
        </button>

        <button
          onClick={triggerRageClick}
          disabled={loading}
          className="bg-[#000000] hover:bg-white/10 text-[#E0D8D0] border border-white/15 rounded-xl p-3.5 text-left transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs mb-1">
            <MousePointerClick className="w-4 h-4" />
            Simulate Rage Click
          </div>
          <span className="text-[11px] text-[#9e968d]">6 fast clicks on dead button</span>
        </button>

        <button
          onClick={triggerLongPause}
          disabled={loading}
          className="bg-[#000000] hover:bg-white/10 text-[#E0D8D0] border border-white/15 rounded-xl p-3.5 text-left transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs mb-1">
            <Timer className="w-4 h-4" />
            Simulate 38s Pause
          </div>
          <span className="text-[11px] text-[#9e968d]">Confusion idle on /signup</span>
        </button>
      </div>

      {lastMessage && (
        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-[#E0D8D0] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{lastMessage}</span>
        </div>
      )}

      {/* Widget Modal Simulation Popup */}
      {showFeedbackModal && (
        <div className="mt-6 p-5 bg-[#141418] text-[#E0D8D0] rounded-2xl border border-white/20 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span className="font-figtree font-semibold text-xs text-[#E0D8D0]">Widget Feedback Modal Prompt</span>
            </div>
            <button
              onClick={() => setShowFeedbackModal(false)}
              className="text-[11px] text-white/40 hover:text-white"
            >
              Skip
            </button>
          </div>
          <p className="text-xs font-figtree text-[#9e968d]">
            Looks like something went wrong or felt confusing. What were you trying to do?
          </p>
          <textarea
            value={feedbackInput}
            onChange={(e) => setFeedbackInput(e.target.value)}
            placeholder="E.g., I tried to submit payment with my card but the page froze..."
            className="w-full text-xs p-2.5 rounded-xl border border-white/15 bg-[#000000] text-[#E0D8D0] placeholder-white/20 font-figtree focus:outline-none focus:border-white/30"
            rows={2}
          />
          <button
            onClick={submitFeedback}
            className="btn-primary w-full py-2 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            Submit Feedback via Widget
          </button>
        </div>
      )}
    </div>
  );
};
