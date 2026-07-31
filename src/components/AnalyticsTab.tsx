import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { ArrowRight, Sparkles, TrendingUp, AlertTriangle, HelpCircle, CheckCircle2 } from "lucide-react";
import { api } from "../services/api";
import { EventSeriesPoint, TopPagePoint, FakeDoor, UsageData } from "../types";

interface AnalyticsTabProps {
  onNavigateTab: (tab: string) => void;
}

type ScenarioId = "checkout_crash" | "onboarding_spike" | "feature_demand" | "live_stream";

interface Scenario {
  id: ScenarioId;
  name: string;
  badge: string;
  description: string;
  aiRecommendation: string;
  series: EventSeriesPoint[];
  topPages: TopPagePoint[];
  metrics: {
    totalEvents: number;
    crashRate: string;
    frictionIndex: string;
    demandScore: string;
  };
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ onNavigateTab }) => {
  const [liveSeries, setLiveSeries] = useState<EventSeriesPoint[]>([]);
  const [liveTopPages, setLiveTopPages] = useState<TopPagePoint[]>([]);
  const [fakeDoors, setFakeDoors] = useState<FakeDoor[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [activeScenario, setActiveScenario] = useState<ScenarioId>("live_stream");
  const [showExamples, setShowExamples] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sData, pData, fData, uData] = await Promise.all([
          api.getAnalyticsEventsOverTime(),
          api.getAnalyticsTopPages(),
          api.getFakeDoors(),
          api.getUsage(),
        ]);
        setLiveSeries(sData.series || []);
        setLiveTopPages(pData.top_pages || []);
        setFakeDoors(fData.fake_doors || []);
        setUsage(uData);
      } catch (e) {
        console.error("Failed to load analytics data", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Pre-configured realistic scenarios for founders to explore
  const scenarios: Record<ScenarioId, Scenario> = {
    checkout_crash: {
      id: "checkout_crash",
      name: "Checkout Crash Wave",
      badge: "Example Scenario",
      description: "E-Commerce launch spike causing Stripe JS null-pointer crashes on checkout submission.",
      aiRecommendation:
        "High crash velocity on /checkout. 78% of users dropped off after encountering the 'stripeToken undefined' error. Priority: Hotfix checkout form handler.",
      metrics: {
        totalEvents: 482,
        crashRate: "34.2%",
        frictionIndex: "High (8.4/10)",
        demandScore: "62/100",
      },
      series: [
        { date: "Day 1", crash: 3, rage_click: 4, long_pause: 8, feedback: 2 },
        { date: "Day 2", crash: 2, rage_click: 6, long_pause: 7, feedback: 3 },
        { date: "Day 3", crash: 4, rage_click: 9, long_pause: 12, feedback: 5 },
        { date: "Day 4 (Launch)", crash: 28, rage_click: 34, long_pause: 22, feedback: 12 },
        { date: "Day 5 (Peak)", crash: 42, rage_click: 48, long_pause: 30, feedback: 16 },
        { date: "Day 6", crash: 31, rage_click: 26, long_pause: 19, feedback: 10 },
        { date: "Day 7", crash: 18, rage_click: 15, long_pause: 14, feedback: 8 },
        { date: "Day 8", crash: 8, rage_click: 11, long_pause: 10, feedback: 6 },
        { date: "Day 9", crash: 5, rage_click: 8, long_pause: 9, feedback: 4 },
        { date: "Day 10", crash: 4, rage_click: 6, long_pause: 8, feedback: 3 },
        { date: "Day 11", crash: 3, rage_click: 5, long_pause: 6, feedback: 3 },
        { date: "Day 12", crash: 2, rage_click: 4, long_pause: 5, feedback: 2 },
        { date: "Day 13", crash: 2, rage_click: 3, long_pause: 5, feedback: 2 },
        { date: "Day 14", crash: 1, rage_click: 3, long_pause: 4, feedback: 1 },
      ],
      topPages: [
        { page_url: "https://myapp.com/checkout", count: 184 },
        { page_url: "https://myapp.com/pricing", count: 112 },
        { page_url: "https://myapp.com/signup", count: 86 },
        { page_url: "https://myapp.com/cart", count: 64 },
        { page_url: "https://myapp.com/dashboard", count: 36 },
      ],
    },

    onboarding_spike: {
      id: "onboarding_spike",
      name: "Onboarding Hesitation",
      badge: "Example Scenario",
      description: "Users spending >30 seconds paused on workspace URL slug field during signup.",
      aiRecommendation:
        "Long pauses dominating /signup. Users are hesitant about workspace slug permanence. Recommended fix: add inline helper note 'You can change this URL anytime'.",
      metrics: {
        totalEvents: 310,
        crashRate: "4.1%",
        frictionIndex: "Medium (6.2/10)",
        demandScore: "74/100",
      },
      series: [
        { date: "Day 1", crash: 1, rage_click: 3, long_pause: 18, feedback: 4 },
        { date: "Day 2", crash: 2, rage_click: 4, long_pause: 22, feedback: 5 },
        { date: "Day 3", crash: 1, rage_click: 5, long_pause: 26, feedback: 6 },
        { date: "Day 4", crash: 2, rage_click: 6, long_pause: 31, feedback: 8 },
        { date: "Day 5", crash: 1, rage_click: 4, long_pause: 35, feedback: 7 },
        { date: "Day 6", crash: 2, rage_click: 5, long_pause: 29, feedback: 6 },
        { date: "Day 7", crash: 1, rage_click: 3, long_pause: 24, feedback: 5 },
        { date: "Day 8", crash: 1, rage_click: 4, long_pause: 20, feedback: 4 },
        { date: "Day 9", crash: 0, rage_click: 3, long_pause: 18, feedback: 3 },
        { date: "Day 10", crash: 1, rage_click: 2, long_pause: 15, feedback: 3 },
        { date: "Day 11", crash: 0, rage_click: 3, long_pause: 14, feedback: 2 },
        { date: "Day 12", crash: 1, rage_click: 2, long_pause: 12, feedback: 2 },
        { date: "Day 13", crash: 0, rage_click: 2, long_pause: 11, feedback: 1 },
        { date: "Day 14", crash: 0, rage_click: 1, long_pause: 9, feedback: 1 },
      ],
      topPages: [
        { page_url: "https://myapp.com/signup", count: 168 },
        { page_url: "https://myapp.com/onboarding/step-2", count: 72 },
        { page_url: "https://myapp.com/pricing", count: 42 },
        { page_url: "https://myapp.com/settings", count: 18 },
        { page_url: "https://myapp.com/login", count: 10 },
      ],
    },

    feature_demand: {
      id: "feature_demand",
      name: "Feature Validation Surge",
      badge: "Example Scenario",
      description: "High click volume and enthusiasm for 'Dark Mode' and 'CSV Export' test buttons.",
      aiRecommendation:
        "Validation surge! 'Dark Mode' test button generated 142 clicks in 48 hours. Sentiment Score 88/100. High conversion probability.",
      metrics: {
        totalEvents: 540,
        crashRate: "1.2%",
        frictionIndex: "Low (2.1/10)",
        demandScore: "92/100",
      },
      series: [
        { date: "Day 1", crash: 1, rage_click: 2, long_pause: 5, feedback: 14 },
        { date: "Day 2", crash: 0, rage_click: 3, long_pause: 6, feedback: 18 },
        { date: "Day 3", crash: 1, rage_click: 2, long_pause: 4, feedback: 28 },
        { date: "Day 4 (Campaign)", crash: 2, rage_click: 4, long_pause: 8, feedback: 62 },
        { date: "Day 5 (Peak)", crash: 1, rage_click: 5, long_pause: 9, feedback: 84 },
        { date: "Day 6", crash: 1, rage_click: 3, long_pause: 7, feedback: 54 },
        { date: "Day 7", crash: 0, rage_click: 2, long_pause: 5, feedback: 38 },
        { date: "Day 8", crash: 1, rage_click: 2, long_pause: 4, feedback: 28 },
        { date: "Day 9", crash: 0, rage_click: 1, long_pause: 4, feedback: 22 },
        { date: "Day 10", crash: 1, rage_click: 2, long_pause: 3, feedback: 18 },
        { date: "Day 11", crash: 0, rage_click: 1, long_pause: 3, feedback: 14 },
        { date: "Day 12", crash: 0, rage_click: 1, long_pause: 2, feedback: 12 },
        { date: "Day 13", crash: 0, rage_click: 1, long_pause: 2, feedback: 10 },
        { date: "Day 14", crash: 0, rage_click: 0, long_pause: 1, feedback: 8 },
      ],
      topPages: [
        { page_url: "https://myapp.com/dashboard", count: 210 },
        { page_url: "https://myapp.com/settings", count: 140 },
        { page_url: "https://myapp.com/reports", count: 95 },
        { page_url: "https://myapp.com/pricing", count: 65 },
        { page_url: "https://myapp.com/home", count: 30 },
      ],
    },

    live_stream: (() => {
      const totalEvents = liveSeries.reduce(
        (acc, c) => acc + c.crash + c.rage_click + c.long_pause + c.feedback,
        0
      );
      const totalCrashes = liveSeries.reduce((acc, c) => acc + c.crash, 0);
      const totalFriction = liveSeries.reduce((acc, c) => acc + c.rage_click + c.long_pause, 0);
      const crashRate = totalEvents > 0 ? `${((totalCrashes / totalEvents) * 100).toFixed(1)}%` : "—";
      const avgSentiment =
        fakeDoors.filter((fd) => fd.sentiment_score !== null).length > 0
          ? Math.round(
              fakeDoors.reduce((acc, fd) => acc + (fd.sentiment_score || 0), 0) /
                fakeDoors.filter((fd) => fd.sentiment_score !== null).length
            )
          : null;

      return {
        id: "live_stream" as ScenarioId,
        name: "Your Live Data",
        badge: "Connected App",
        description: "Real telemetry from your own connected application — not a simulation.",
        aiRecommendation:
          totalEvents > 0
            ? `${totalEvents} events captured in the last 30 days across your connected app.`
            : "No events yet. Install the widget or use the sandbox above to generate your first real event.",
        metrics: {
          totalEvents,
          crashRate,
          frictionIndex: totalEvents > 0 ? `${totalFriction} events` : "—",
          demandScore: avgSentiment !== null ? `${avgSentiment}/100 avg` : "No sentiment data yet",
        },
        series: liveSeries,
        topPages: liveTopPages,
      };
    })(),
  };

  const currentScenario = scenarios[activeScenario];

  return (
    <div className="space-y-8 font-figtree text-[#E0D8D0]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-garamond text-4xl text-[#E0D8D0] font-light">Product Intelligence & Analytics</h1>
          <p className="text-xs text-[#9e968d] mt-1">
            "Your Live Data" reflects your actual connected app. The other cards are illustrative examples of what different patterns can look like — not your real data.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-mono text-emerald-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Grane Scenario Simulator Active</span>
        </div>
      </div>

      {/* Scenario Selector Toolbar */}
      <div className="card-cream border border-white/15 p-4 bg-[#0d0d0f] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-white/50 font-semibold">
            Viewing
          </span>
          <span className="text-xs text-emerald-400 font-mono font-semibold">
            {currentScenario.badge}
          </span>
        </div>

        <button
          onClick={() => setActiveScenario("live_stream")}
          className={`w-full p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
            activeScenario === "live_stream"
              ? "bg-white text-black border-white shadow-lg shadow-white/10"
              : "bg-[#000000] text-[#E0D8D0] border-white/10 hover:border-white/30 hover:bg-white/5"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-xs">{scenarios.live_stream.name}</span>
            {activeScenario === "live_stream" && <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />}
          </div>
          <p className={`text-[11px] leading-relaxed ${activeScenario === "live_stream" ? "text-black/70" : "text-[#9e968d]"}`}>
            {scenarios.live_stream.description}
          </p>
        </button>

        <button
          onClick={() => setShowExamples(!showExamples)}
          className="text-[11px] text-[#9e968d] hover:text-white transition-colors cursor-pointer underline decoration-dotted underline-offset-4"
        >
          {showExamples ? "Hide example scenarios" : "Show example scenarios (not your data)"}
        </button>

        {showExamples && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {(["checkout_crash", "onboarding_spike", "feature_demand"] as ScenarioId[]).map((key) => {
              const sc = scenarios[key];
              const isSelected = activeScenario === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveScenario(key)}
                  className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-white text-black border-white shadow-lg shadow-white/10 scale-[1.02]"
                      : "bg-[#000000] text-[#E0D8D0] border-white/10 hover:border-white/30 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs">{sc.name}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />}
                  </div>
                  <p className={`text-[11px] line-clamp-2 leading-relaxed ${isSelected ? "text-black/70" : "text-[#9e968d]"}`}>
                    {sc.description}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-cream border border-white/15 p-5 bg-[#0d0d0f] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">TOTAL EVENTS</span>
          <span className="font-garamond text-3xl font-light text-white block">{currentScenario.metrics.totalEvents}</span>
          <span className="text-[10px] text-emerald-400 font-mono">Captured this cycle</span>
        </div>

        <div className="card-cream border border-white/15 p-5 bg-[#0d0d0f] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">CRASH RATE</span>
          <span className="font-garamond text-3xl font-light text-amber-400 block">{currentScenario.metrics.crashRate}</span>
          <span className="text-[10px] text-white/40 font-mono">JS runtime exceptions</span>
        </div>

        <div className="card-cream border border-white/15 p-5 bg-[#0d0d0f] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">FRICTION INDEX</span>
          <span className="font-garamond text-3xl font-light text-purple-300 block">{currentScenario.metrics.frictionIndex}</span>
          <span className="text-[10px] text-white/40 font-mono">Rage clicks & hesitation</span>
        </div>

        <div className="card-cream border border-white/15 p-5 bg-[#0d0d0f] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">DEMAND SCORE</span>
          <span className="font-garamond text-3xl font-light text-emerald-400 block">{currentScenario.metrics.demandScore}</span>
          <span className="text-[10px] text-emerald-400 font-mono">Fake Door interest</span>
        </div>
      </div>

      {/* AI Intelligence Diagnosis Callout */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-[#0d0d0f] to-[#15151a] border border-emerald-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-semibold text-emerald-400 block">
              Grane AI Executive Recommendation
            </span>
            <p className="text-sm text-[#E0D8D0] leading-relaxed mt-1">
              {currentScenario.aiRecommendation}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab("events")}
          className="btn-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <span>View Detailed Logs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Section 1: Events Over Time Area Chart */}
      <div className="card-cream border border-white/15 p-6 space-y-4 bg-[#0d0d0f]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-garamond text-2xl text-[#E0D8D0] font-light">Events & Friction Over Time</h3>
            <p className="text-xs text-[#9e968d]">
              14-day timeline breakdown by event type for <strong className="text-white">{currentScenario.name}</strong>
            </p>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ffa946]" /> Crashes</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#c084fc]" /> Rage Clicks</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#2dd4bf]" /> Long Pauses</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#60a5fa]" /> Feedback</span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentScenario.series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000000",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "12px",
                  color: "#E0D8D0",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="crash" stackId="1" stroke="#ffa946" fill="#ffa946" fillOpacity={0.6} name="Crashes" />
              <Area type="monotone" dataKey="rage_click" stackId="1" stroke="#c084fc" fill="#c084fc" fillOpacity={0.6} name="Rage Clicks" />
              <Area type="monotone" dataKey="long_pause" stackId="1" stroke="#2dd4bf" fill="#2dd4bf" fillOpacity={0.6} name="Long Pauses" />
              <Area type="monotone" dataKey="feedback" stackId="1" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.6} name="Feedback" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Top Problem Areas + Fake Door Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section 2: Top Problem Areas */}
        <div className="card-cream border border-white/15 p-6 space-y-4 bg-[#0d0d0f]">
          <div>
            <h3 className="font-garamond text-2xl text-[#E0D8D0] font-light">Top Problem Hotspots</h3>
            <p className="text-xs text-[#9e968d]">Pages driving maximum friction and user dropoffs</p>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentScenario.topPages} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <YAxis dataKey="page_url" type="category" stroke="rgba(255,255,255,0.3)" fontSize={11} width={110} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000000",
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "12px",
                    color: "#E0D8D0",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#2dd4bf" radius={[0, 8, 8, 0]} name="Events Captured" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 3: Fake Door Comparison */}
        <div className="card-cream border border-white/15 p-6 space-y-4 flex flex-col justify-between bg-[#0d0d0f]">
          <div>
            <h3 className="font-garamond text-2xl text-[#E0D8D0] font-light">Fake Door Demand Validation</h3>
            <p className="text-xs text-[#9e968d]">Which features users are actively clicking</p>
          </div>

          {fakeDoors.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-xs text-[#9e968d]">
                You haven't created any Fake Door tests yet.
              </p>
              <button
                onClick={() => onNavigateTab("fake_doors")}
                className="btn-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Go to Fake Doors</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              {fakeDoors.map((fd) => (
                <div key={fd.id} className="p-3.5 bg-[#000000] border border-white/10 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-xs text-[#E0D8D0] block">{fd.feature_name}</span>
                    <span className="text-[11px] text-[#9e968d]">{fd.button_text}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-garamond text-2xl font-light text-emerald-400 block">{fd.total_clicks}</span>
                    <span className="text-[10px] text-[#9e968d] uppercase tracking-wider">clicks</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Usage Progress */}
      {usage && (
        <div className="card-dark border border-white/15 p-8 space-y-4 bg-[#08080a]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="font-garamond text-2xl text-[#E0D8D0] font-light">Monthly Event Usage</h3>
              <p className="text-xs text-[#9e968d]">Current Plan: <strong className="text-white uppercase">{usage.plan}</strong></p>
            </div>
            <span className="text-xs font-mono text-[#E0D8D0]">
              {usage.events_used} / {usage.events_limit} events consumed
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-[#000000] border border-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${usage.percent_used}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-[#9e968d] gap-2 pt-1">
            <span>{usage.percent_used}% of monthly quota used</span>
            {usage.percent_used >= 80 && (
              <button
                onClick={() => onNavigateTab("billing")}
                className="text-amber-400 font-semibold underline flex items-center gap-1 cursor-pointer"
              >
                <span>Nearing your limit. Upgrade plan →</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
