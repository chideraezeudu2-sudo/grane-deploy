import React, { useState, useEffect } from "react";
import { Check, ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import { api } from "../services/api";
import { UsageData, User } from "../types";

interface UsageBillingTabProps {
  user: User;
  onUserUpdated: () => void;
}

export const UsageBillingTab: React.FC<UsageBillingTabProps> = ({ user, onUserUpdated }) => {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsage = async () => {
    try {
      const data = await api.getUsage();
      setUsage(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [user.plan]);

  const handleUpgrade = async (targetPlan: "basic" | "pro") => {
    setActionLoading(true);
    try {
      const res = await api.createCheckout(targetPlan);
      if (res.checkout_url) {
        // Real Stripe Checkout — redirect the browser. The plan itself
        // only updates once Stripe confirms payment and calls our
        // webhook (POST /api/billing/webhook), not immediately here.
        window.location.href = res.checkout_url;
      }
    } catch (e: any) {
      alert(e.message);
      setActionLoading(false);
    }
  };

  // Cancelling back to Free isn't a "checkout" — Stripe has no Free
  // price to check out into. Cancellation happens through the Stripe
  // Customer Portal; our webhook (customer.subscription.deleted) sets
  // the plan back to 'free' once the cancellation takes effect.
  const handleDowngradeToFree = async () => {
    await handlePortal();
  };

  const handlePortal = async () => {
    try {
      const res = await api.getBillingPortal();
      if (res.portal_url) {
        window.open(res.portal_url, "_blank");
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-10 font-figtree text-[#E0D8D0]">
      <div>
        <h1 className="font-garamond text-4xl text-[#E0D8D0] font-light">Usage & Billing</h1>
        <p className="text-xs text-[#9e968d] mt-1">
          Monitor event caps, manage your Stripe subscription, and switch plan tiers seamlessly.
        </p>
      </div>

      {/* Section 1: Current Plan */}
      <div className="card-cream border border-white/15 p-8 space-y-6 bg-[#0d0d0f]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] font-semibold text-emerald-400">
              Current Active Tier
            </span>
            <h2 className="font-garamond text-4xl font-light text-[#E0D8D0] capitalize mt-1">
              {user.plan} Plan
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {user.plan === "free" && (
              <>
                <button
                  onClick={() => handleUpgrade("basic")}
                  disabled={actionLoading}
                  className="btn-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Upgrade to Basic — $20/mo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleUpgrade("pro")}
                  disabled={actionLoading}
                  className="btn-secondary px-5 py-2.5 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Upgrade to Pro — $50/mo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {user.plan === "basic" && (
              <button
                onClick={() => handleUpgrade("pro")}
                disabled={actionLoading}
                className="btn-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <span>Upgrade to Pro — $50/mo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {user.plan === "pro" && (
              <span className="text-xs font-sans uppercase tracking-wider font-semibold text-emerald-300 bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/30">
                You're on our top plan.
              </span>
            )}
          </div>
        </div>

        {/* Usage Progress Bar */}
        {usage && (
          <div className="space-y-2 pt-4 border-t border-white/10">
            <div className="flex justify-between text-xs text-[#9e968d]">
              <span>
                <strong className="text-[#E0D8D0]">{usage.events_used}</strong> of <strong className="text-[#E0D8D0]">{usage.events_limit}</strong> events used this billing period
              </span>
              <span className="font-semibold text-[#E0D8D0]">{usage.percent_used}%</span>
            </div>
            <div className="w-full h-3 bg-[#000000] border border-white/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${usage.percent_used}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Manage Billing (Paid Plans Only) */}
      {(user.plan === "basic" || user.plan === "pro") && (
        <div className="card-dark border border-white/15 p-8 space-y-4 bg-[#08080a]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-garamond text-2xl text-[#E0D8D0] font-light">Manage Billing</h3>
              <p className="text-xs text-[#9e968d] mt-0.5">
                Update credit card details, download monthly invoices, or modify your subscription via Stripe.
              </p>
            </div>
            <button
              onClick={handlePortal}
              className="btn-secondary px-5 py-2.5 text-xs font-medium uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <span>Manage Billing</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Section 3: Plan Comparison Grid */}
      <div className="space-y-6">
        <div>
          <h3 className="font-garamond text-3xl text-[#E0D8D0] font-light">Plan Comparison</h3>
          <p className="text-xs text-[#9e968d]">Compare limits and features across plan tiers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free */}
          <div className={`card-cream flex flex-col justify-between bg-[#0d0d0f] border ${user.plan === "free" ? "border-emerald-400" : "border-white/15"}`}>
            <div>
              <h3 className="font-figtree font-medium text-xl text-[#E0D8D0]">Free</h3>
              <div className="my-4">
                <span className="font-garamond text-5xl font-light text-[#E0D8D0]">$0</span>
                <span className="text-xs text-[#9e968d]"> / month</span>
              </div>
              <ul className="space-y-3 font-figtree text-xs text-[#9e968d] my-6">
                <li className="flex items-center gap-2 text-[#E0D8D0]"><Check className="w-4 h-4 text-emerald-400" /> 500 events/month</li>
                <li className="flex items-center gap-2 text-[#E0D8D0]"><Check className="w-4 h-4 text-emerald-400" /> 7-day data retention</li>
                <li className="flex items-center gap-2 text-[#E0D8D0]"><Check className="w-4 h-4 text-emerald-400" /> 1 active Fake Door</li>
                <li className="flex items-center gap-2 text-white/30 line-through">No AI diagnosis</li>
              </ul>
            </div>
            {user.plan === "free" ? (
              <button disabled className="btn-secondary w-full py-3 text-xs uppercase tracking-wider font-semibold opacity-50 cursor-not-allowed">
                Current Plan
              </button>
            ) : (
              <button
                onClick={handleDowngradeToFree}
                className="btn-secondary w-full py-3 text-xs uppercase tracking-wider font-medium cursor-pointer"
              >
                Cancel Subscription
              </button>
            )}
          </div>

          {/* Basic */}
          <div className={`card-cream flex flex-col justify-between bg-[#0d0d0f] border ${user.plan === "basic" ? "border-emerald-400" : "border-white/15"}`}>
            <div>
              <h3 className="font-figtree font-medium text-xl text-[#E0D8D0]">Basic</h3>
              <div className="my-4">
                <span className="font-garamond text-5xl font-light text-[#E0D8D0]">$20</span>
                <span className="text-xs text-[#9e968d]"> / month</span>
              </div>
              <ul className="space-y-3 font-figtree text-xs text-[#9e968d] my-6">
                <li className="flex items-center gap-2 text-[#E0D8D0] font-medium"><Check className="w-4 h-4 text-emerald-400" /> 5,000 events/month</li>
                <li className="flex items-center gap-2 text-[#E0D8D0]"><Check className="w-4 h-4 text-emerald-400" /> 30-day data retention</li>
                <li className="flex items-center gap-2 text-[#E0D8D0]"><Check className="w-4 h-4 text-emerald-400" /> 3 active Fake Doors + AI sentiment</li>
                <li className="flex items-center gap-2 text-[#E0D8D0]"><Check className="w-4 h-4 text-emerald-400" /> AI crash translation</li>
              </ul>
            </div>
            {user.plan === "basic" ? (
              <button disabled className="btn-secondary w-full py-3 text-xs uppercase tracking-wider font-semibold opacity-50 cursor-not-allowed">
                Current Plan
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade("basic")}
                className="btn-primary w-full py-3 text-xs uppercase tracking-wider font-semibold cursor-pointer"
              >
                {user.plan === "pro" ? "Downgrade to Basic" : "Upgrade to Basic"}
              </button>
            )}
          </div>

          {/* Pro */}
          <div className={`card-cream flex flex-col justify-between bg-[#0d0d0f] border ${user.plan === "pro" ? "border-emerald-400" : "border-white/15"}`}>
            <div>
              <h3 className="font-figtree font-medium text-xl text-[#E0D8D0]">Pro</h3>
              <div className="my-4">
                <span className="font-garamond text-5xl font-light text-[#E0D8D0]">$50</span>
                <span className="text-xs text-[#9e968d]"> / month</span>
              </div>
              <ul className="space-y-3 font-figtree text-xs text-[#9e968d] my-6">
                <li className="flex items-center gap-2 text-[#E0D8D0] font-medium"><Check className="w-4 h-4 text-emerald-400" /> 25,000 events/month</li>
                <li className="flex items-center gap-2 text-[#E0D8D0]"><Check className="w-4 h-4 text-emerald-400" /> 90-day data retention</li>
                <li className="flex items-center gap-2 text-[#E0D8D0]"><Check className="w-4 h-4 text-emerald-400" /> Unlimited Fake Doors + AI sentiment</li>
                <li className="flex items-center gap-2 text-[#E0D8D0]"><Check className="w-4 h-4 text-emerald-400" /> AI crash + AI UX friction translation</li>
              </ul>
            </div>
            {user.plan === "pro" ? (
              <button disabled className="btn-secondary w-full py-3 text-xs uppercase tracking-wider font-semibold opacity-50 cursor-not-allowed">
                Current Plan
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade("pro")}
                className="btn-primary w-full py-3 text-xs uppercase tracking-wider font-semibold cursor-pointer"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
