import React, { useState } from "react";
import {
  LogOut,
  CreditCard,
  ChevronDown,
  Activity as EventIcon,
  BarChart3,
  DoorClosed,
  Copy,
  Check,
  Zap,
  Sparkles,
} from "lucide-react";
import { User } from "../types";
import { EventFeedTab } from "./EventFeedTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { FakeDoorsTab } from "./FakeDoorsTab";
import { UsageBillingTab } from "./UsageBillingTab";

interface DashboardShellProps {
  user: User;
  onLogout: () => void;
  onUserUpdated: () => void;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ user, onLogout, onUserUpdated }) => {
  const [activeTab, setActiveTab] = useState<"events" | "analytics" | "fake_doors" | "billing">("events");
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const snippetCode = `<script src="https://cdn.grane.ai/widget.js" data-app-id="${user.app_id}"></script>`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(snippetCode);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0D8D0] font-figtree flex flex-col selection:bg-white selection:text-black">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#08080a]/90 backdrop-blur-md border-b border-white/10 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo - Name Only */}
          <button
            onClick={() => setActiveTab("events")}
            className="flex items-center gap-3 cursor-pointer focus:outline-none group text-left"
          >
            <span className="font-garamond text-3xl font-light tracking-tight text-[#E0D8D0] group-hover:text-white transition-colors">
              Grane
            </span>
          </button>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            {/* Quick App ID indicator */}
            <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-mono text-[#9e968d]">
              <span className="text-white/40">App ID:</span>
              <span className="text-[#E0D8D0] font-semibold">{user.app_id.slice(0, 10)}...</span>
            </div>

            {/* Account Menu Button */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="bg-white/5 border border-white/15 rounded-full pl-3 pr-4 py-1.5 flex items-center gap-2.5 cursor-pointer font-medium text-xs text-[#E0D8D0] hover:bg-white/10 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-white/10 text-[#E0D8D0] flex items-center justify-center border border-white/20 font-bold text-[10px]">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-medium">{user.email}</span>
                <span className="bg-[#6C63FF]/20 text-[#6C63FF] border border-[#6C63FF]/30 text-[10px] font-sans uppercase tracking-wider px-2 py-0.5 rounded-full">
                  {user.plan}
                </span>
                <ChevronDown className="w-4 h-4 text-white/60" />
              </button>

              {/* Expanded Account Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0e0e11] border border-white/15 rounded-2xl p-3 shadow-2xl z-50 space-y-2">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-[10px] uppercase font-sans tracking-[0.15em] text-white/40">Signed in as</p>
                    <p className="text-xs font-semibold text-[#E0D8D0] truncate mt-0.5">{user.email}</p>
                    <span className="inline-block mt-1.5 bg-white/10 text-[#E0D8D0] border border-white/15 text-[10px] font-sans uppercase tracking-widest px-2 py-0.5 rounded-full">
                      {user.plan.toUpperCase()} PLAN
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab("billing");
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-white/10 text-white/80 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>Billing & Upgrade</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-red-500/20 text-red-400 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* REDESIGNED SIDEBAR */}
        <aside className="md:col-span-3 lg:col-span-3 space-y-6">
          <div className="bg-[#0c0c0e] border border-white/15 rounded-2xl p-4 shadow-2xl space-y-6">
            {/* Sidebar Header */}
            <div className="px-2 pt-1 pb-3 border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-white/40 block">
                  Product Intelligence
                </span>
                <span className="font-garamond text-xl font-light text-[#E0D8D0]">
                  Dashboard
                </span>
              </div>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>

            {/* Sidebar Tab Navigation */}
            <nav className="space-y-1.5">
              <button
                onClick={() => setActiveTab("events")}
                className={`w-full text-left px-3.5 py-3 rounded-xl font-figtree text-xs tracking-wider font-medium flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === "events"
                    ? "bg-white text-black font-semibold shadow-lg shadow-white/10 scale-[1.02]"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <EventIcon className={`w-4 h-4 shrink-0 ${activeTab === "events" ? "text-black" : "text-emerald-400"}`} />
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider font-semibold">Event Feed</span>
                    <span className={`text-[10px] ${activeTab === "events" ? "text-black/60" : "text-white/40"}`}>
                      Live error stream
                    </span>
                  </div>
                </div>
                <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full ${
                  activeTab === "events" ? "bg-black text-white" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}>
                  Live
                </span>
              </button>

              <button
                onClick={() => setActiveTab("analytics")}
                className={`w-full text-left px-3.5 py-3 rounded-xl font-figtree text-xs tracking-wider font-medium flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === "analytics"
                    ? "bg-white text-black font-semibold shadow-lg shadow-white/10 scale-[1.02]"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className={`w-4 h-4 shrink-0 ${activeTab === "analytics" ? "text-black" : "text-cyan-400"}`} />
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider font-semibold">Analytics</span>
                    <span className={`text-[10px] ${activeTab === "analytics" ? "text-black/60" : "text-white/40"}`}>
                      Graphs & Scenarios
                    </span>
                  </div>
                </div>
                <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full ${
                  activeTab === "analytics" ? "bg-black text-white" : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                }`}>
                  4 Scenarios
                </span>
              </button>

              <button
                onClick={() => setActiveTab("fake_doors")}
                className={`w-full text-left px-3.5 py-3 rounded-xl font-figtree text-xs tracking-wider font-medium flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === "fake_doors"
                    ? "bg-white text-black font-semibold shadow-lg shadow-white/10 scale-[1.02]"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <DoorClosed className={`w-4 h-4 shrink-0 ${activeTab === "fake_doors" ? "text-black" : "text-purple-400"}`} />
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider font-semibold">Fake Doors</span>
                    <span className={`text-[10px] ${activeTab === "fake_doors" ? "text-black/60" : "text-white/40"}`}>
                      Feature validation
                    </span>
                  </div>
                </div>
                <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full ${
                  activeTab === "fake_doors" ? "bg-black text-white" : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                }`}>
                  Test
                </span>
              </button>

              <button
                onClick={() => setActiveTab("billing")}
                className={`w-full text-left px-3.5 py-3 rounded-xl font-figtree text-xs tracking-wider font-medium flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === "billing"
                    ? "bg-white text-black font-semibold shadow-lg shadow-white/10 scale-[1.02]"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className={`w-4 h-4 shrink-0 ${activeTab === "billing" ? "text-black" : "text-amber-400"}`} />
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider font-semibold">Usage & Billing</span>
                    <span className={`text-[10px] ${activeTab === "billing" ? "text-black/60" : "text-white/40"}`}>
                      Quota & Invoices
                    </span>
                  </div>
                </div>
                <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full ${
                  activeTab === "billing" ? "bg-black text-white" : "bg-white/10 text-white/70 border border-white/15"
                }`}>
                  {user.plan.toUpperCase()}
                </span>
              </button>
            </nav>

            {/* Quick Snippet Installer in Sidebar */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#9e968d]">
                <span className="font-semibold text-white/80">Widget Script</span>
                <span className="text-[10px] font-mono text-emerald-400">Ready</span>
              </div>
              <div className="bg-[#000000] border border-white/10 rounded-xl p-3 text-[11px] font-mono break-all text-white/60 space-y-2">
                <p className="leading-relaxed">
                  &lt;script src="https://cdn.grane.ai/widget.js" data-app-id="{user.app_id}"&gt;&lt;/script&gt;
                </p>
                <button
                  onClick={handleCopySnippet}
                  className="w-full btn-secondary py-1.5 text-[11px] flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                >
                  {copiedSnippet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSnippet ? "Copied to Clipboard!" : "Copy Snippet"}</span>
                </button>
              </div>
            </div>

            {/* Sidebar Plan Status Footer */}
            <div className="bg-[#050505] border border-white/10 rounded-xl p-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-white/40 block font-mono">CURRENT PLAN</span>
                <span className="font-semibold text-white uppercase">{user.plan} Tier</span>
              </div>
              <button
                onClick={() => setActiveTab("billing")}
                className="text-[11px] font-semibold text-emerald-400 hover:underline cursor-pointer"
              >
                Upgrade →
              </button>
            </div>
          </div>
        </aside>

        {/* Tab Content Area */}
        <main className="md:col-span-9 lg:col-span-9">
          {activeTab === "events" && <EventFeedTab user={user} onNavigateTab={(t) => setActiveTab(t as any)} />}
          {activeTab === "analytics" && <AnalyticsTab onNavigateTab={(t) => setActiveTab(t as any)} />}
          {activeTab === "fake_doors" && <FakeDoorsTab user={user} onNavigateTab={(t) => setActiveTab(t as any)} />}
          {activeTab === "billing" && <UsageBillingTab user={user} onUserUpdated={onUserUpdated} />}
        </main>
      </div>
    </div>
  );
};
