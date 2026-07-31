import React, { useState, useEffect } from "react";
import { Copy, Check, ChevronDown, ChevronUp, AlertCircle, MousePointerClick, Timer, MessageSquare, Sparkles, RefreshCw } from "lucide-react";
import { EventItem, User } from "../types";
import { api } from "../services/api";
import { WidgetSimulator } from "./WidgetSimulator";

interface EventFeedTabProps {
  user: User;
  onNavigateTab: (tab: string) => void;
}

export const EventFeedTab: React.FC<EventFeedTabProps> = ({ user, onNavigateTab }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [limit, setLimit] = useState(20);

  const fetchEvents = async () => {
    try {
      const data = await api.getEvents(limit, 0);
      setEvents(data.events || []);
    } catch (e) {
      console.error("Failed to load events", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // Poll every 10 seconds for asynchronous AI diagnosis updates as per spec frontend notes
    const interval = setInterval(fetchEvents, 10000);
    return () => clearInterval(interval);
  }, [limit]);

  const snippet = `<script src="${window.location.origin}/widget.js" data-app-id="${user.app_id}" data-color="#6C63FF" data-position="bottom-right"></script>`;
  // data-color: any hex color, matches the customer's own branding
  // data-position: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  // data-button-icon: any emoji or short text for the always-on button (defaults to MessageCircle icon)

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const getTypeBadge = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      crash: <AlertCircle className="w-3.5 h-3.5" />,
      rage_click: <MousePointerClick className="w-3.5 h-3.5" />,
      long_pause: <Timer className="w-3.5 h-3.5" />,
      feedback: <MessageSquare className="w-3.5 h-3.5" />,
    };
    const labelMap: Record<string, string> = {
      crash: "Crash",
      rage_click: "Rage Click",
      long_pause: "Long Pause",
      feedback: "Feedback",
    };
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-sans uppercase tracking-wider font-medium bg-white/10 text-[#E0D8D0] border border-white/20">
        {iconMap[type] || null} {labelMap[type] || type}
      </span>
    );
  };

  return (
    <div className="space-y-8 font-figtree text-[#E0D8D0]">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-garamond text-4xl text-[#E0D8D0] font-light">
            {events.length === 0 ? "Let's get your widget installed" : "Event Feed"}
          </h1>
          <p className="text-xs text-[#9e968d] mt-1">
            Real-time user friction, JavaScript error capture, and AI plain-English diagnoses.
          </p>
        </div>
        <button
          onClick={fetchEvents}
          className="btn-secondary px-4 py-2 text-xs flex items-center gap-2 cursor-pointer font-medium uppercase tracking-wider"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Feed
        </button>
      </div>

      {/* Interactive Sandbox Banner */}
      <WidgetSimulator appId={user.app_id} onEventSent={fetchEvents} />

      {/* Snippet Block Box */}
      <div className="card-cream border border-white/15 p-6 space-y-3 bg-[#0d0d0f]">
        <div className="flex items-center justify-between">
          <span className="font-figtree text-xs uppercase tracking-[0.15em] font-medium text-[#E0D8D0]">
            Your Grane Snippet (App ID: {user.app_id})
          </span>
          <button
            onClick={() => setShowHelpGuide(!showHelpGuide)}
            className="text-xs text-[#6C63FF] hover:underline cursor-pointer"
          >
            {showHelpGuide ? "Hide installation guide" : "See installation guide"}
          </button>
        </div>
        <div className="bg-[#000000] text-white/80 p-4 rounded-xl border border-white/15 font-mono text-xs flex items-center justify-between gap-4 overflow-x-auto">
          <code>{snippet}</code>
          <button
            onClick={handleCopy}
            className="btn-primary px-3.5 py-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 cursor-pointer font-sans"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>

        {showHelpGuide && (
          <div className="p-4 bg-white/5 border border-white/15 rounded-xl text-xs text-[#E0D8D0] space-y-2">
            <p className="font-semibold text-[#E0D8D0]">Quick Installation Steps:</p>
            <ol className="list-decimal pl-5 space-y-1 text-[#9e968d]">
              <li>Copy the script tag above.</li>
              <li>Open your app's main HTML file (e.g. index.html).</li>
              <li>Paste the script directly before the closing <code>&lt;/body&gt;</code> tag.</li>
              <li>Deploy or refresh your page. Events will begin streaming automatically!</li>
            </ol>
          </div>
        )}
      </div>

      {/* Feed List or Empty State */}
      {events.length === 0 ? (
        <div className="card-cream text-center py-16 space-y-4 border border-white/15">
          <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-[#E0D8D0]">
            <Sparkles className="w-7 h-7 text-[#6C63FF]" />
          </div>
          <h3 className="font-garamond text-3xl text-[#E0D8D0] font-light">No events collected yet</h3>
          <p className="text-xs text-[#9e968d] max-w-md mx-auto leading-relaxed">
            Paste the snippet above into your website, or use the Interactive Sandbox above to generate your first test event!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((evt) => {
            const isExpanded = expandedId === evt.id;
            return (
              <div
                key={evt.id}
                onClick={() => setExpandedId(isExpanded ? null : evt.id)}
                className="card-cream hover:border-white/30 border border-white/15 p-6 cursor-pointer transition-all space-y-4 bg-[#0d0d0f]"
              >
                {/* Event Row Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    {getTypeBadge(evt.type)}
                    <span className="font-mono text-xs text-white/70 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                      {evt.page_url}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#9e968d]" title={new Date(evt.created_at).toLocaleString()}>
                    <span>{getRelativeTime(evt.created_at)}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-white/60" /> : <ChevronDown className="w-4 h-4 text-white/60" />}
                  </div>
                </div>

                {/* AI Diagnosis Box */}
                <div className="bg-[#000000] text-[#E0D8D0] p-4 rounded-2xl border border-white/15 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#6C63FF]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Diagnosis</span>
                  </div>
                  <p className="text-xs font-figtree text-[#E0D8D0] leading-relaxed">
                    {evt.ai_diagnosis || "AI diagnosis pending..."}
                  </p>
                </div>

                {/* User Feedback Block if present */}
                {evt.user_feedback && (
                  <div className="bg-white/5 border-l-2 border-[#6C63FF] p-3 rounded-r-xl text-xs text-[#E0D8D0] space-y-1">
                    <span className="font-semibold text-[#6C63FF]">User Feedback:</span>
                    <blockquote className="italic font-figtree text-[#9e968d]">"{evt.user_feedback}"</blockquote>
                  </div>
                )}

                {/* Technical Raw Details Expansion */}
                {isExpanded && (
                  <div className="pt-3 border-t border-white/10 text-xs font-mono bg-[#000000] text-[#9e968d] p-4 rounded-xl overflow-x-auto space-y-2 border border-white/10">
                    <div className="font-semibold text-white/80">Raw Technical Details:</div>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(evt.raw_data, null, 2)}</pre>
                  </div>
                )}
              </div>
            );
          })}

          {events.length >= limit && (
            <div className="text-center pt-4">
              <button
                onClick={() => setLimit((prev) => prev + 20)}
                className="btn-secondary px-6 py-2.5 font-medium text-xs uppercase tracking-wider cursor-pointer"
              >
                Load more events
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
