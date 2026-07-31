import React from "react";
import { ArrowLeft } from "lucide-react";

interface LegalPageProps {
  type: "tos" | "privacy";
  onNavigate: (route: string) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type, onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-[#E0D8D0] font-figtree p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <button
          onClick={() => onNavigate("landing")}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#6C63FF] hover:underline mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Grane</span>
        </button>

        <div className="flex items-center gap-3 mb-8">
          <span className="font-garamond text-4xl font-light tracking-tight text-[#E0D8D0]">
            Grane
          </span>
          <span className="text-white/30 text-2xl">/</span>
          <h1 className="font-garamond text-3xl md:text-4xl font-light text-[#E0D8D0]">
            {type === "tos" ? "Terms of Service" : "Privacy Policy"}
          </h1>
        </div>

        <div className="card-cream border border-white/15 bg-[#0d0d0f] p-8 md:p-12 space-y-6 leading-relaxed text-sm md:text-base text-[#E0D8D0]">
          <p className="text-[10px] font-sans uppercase tracking-[0.2em] font-semibold text-white/40">
            Last updated: July 29, 2026
          </p>

          {type === "tos" ? (
            <>
              <h2 className="font-garamond text-2xl text-[#E0D8D0] font-light">1. Acceptance of Terms</h2>
              <p className="text-xs md:text-sm text-[#9e968d]">
                By accessing or using Grane ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.
              </p>

              <h2 className="font-garamond text-2xl text-[#E0D8D0] font-light">2. Description of Service</h2>
              <p className="text-xs md:text-sm text-[#9e968d]">
                Grane provides a website widget and dashboard that detects application errors and user friction, generates AI-based diagnostic summaries, and allows feature validation testing ("Fake Doors"). The Service is provided on a subscription basis with Free, Basic, and Pro tiers as described on our Pricing page.
              </p>

              <h2 className="font-garamond text-2xl text-[#E0D8D0] font-light">3. Account Registration</h2>
              <p className="text-xs md:text-sm text-[#9e968d]">
                You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.
              </p>

              <h2 className="font-garamond text-2xl text-[#E0D8D0] font-light">4. Acceptable Use</h2>
              <p className="text-xs md:text-sm text-[#9e968d]">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-xs md:text-sm text-[#9e968d]">
                <li>Use the Service to collect data on users without appropriate disclosure in your own application's privacy policy</li>
                <li>Attempt to reverse-engineer, decompile, or interfere with the Service's operation</li>
                <li>Use the Service to store or transmit unlawful, harmful, or infringing content</li>
                <li>Exceed reasonable API request volumes in a manner that degrades Service performance for other users</li>
              </ul>

              <h2 className="font-garamond text-2xl text-[#E0D8D0] font-light">5. Data and Privacy</h2>
              <p className="text-xs md:text-sm text-[#9e968d]">
                Our collection and use of data, including data collected via the widget from your end users, is governed by our Privacy Policy. You are responsible for ensuring your own use of the Service, including widget installation on your application, complies with applicable privacy laws in your jurisdiction.
              </p>

              <h2 className="font-garamond text-2xl text-[#E0D8D0] font-light">6. Subscription and Billing</h2>
              <p className="text-xs md:text-sm text-[#9e968d]">
                Paid plans are billed monthly via Stripe. You may upgrade, downgrade, or cancel your subscription at any time through your account dashboard. Downgrades and cancellations take effect at the end of the current billing period.
              </p>

              <h2 className="font-garamond text-2xl text-[#E0D8D0] font-light">7. Contact</h2>
              <p className="text-xs md:text-sm text-[#9e968d]">
                Questions about these Terms can be directed to{" "}
                <a href="mailto:support@grane.ai" className="underline font-semibold text-[#6C63FF]">
                  support@grane.ai
                </a>.
              </p>
            </>
          ) : (
            <>
              <h2 className="font-garamond text-2xl text-[#E0D8D0] font-light">1. Overview</h2>
              <p className="text-xs md:text-sm text-[#9e968d]">
                This Privacy Policy explains how Grane ("we," "us") collects, uses, and protects information when you use our Service, including our dashboard (used by our direct customers, "Users") and our JavaScript widget (embedded by Users into their own applications, which collects data from their end users, "End Users").
              </p>

              <h2 className="font-garamond text-2xl text-[#E0D8D0] font-light">2. Information We Collect</h2>
              <p className="text-xs md:text-sm text-[#9e968d]"><strong className="text-[#E0D8D0]">From Users:</strong> Email address, payment information (processed via Stripe), usage data.</p>
              <p className="text-xs md:text-sm text-[#9e968d]"><strong className="text-[#E0D8D0]">From End Users (via Widget):</strong> Technical error data, behavioral signals (rage-clicks, long pauses), optional free-text feedback.</p>

              <h2 className="font-garamond text-2xl text-[#E0D8D0] font-light">3. Automatic PII Redaction</h2>
              <p className="text-xs md:text-sm text-[#9e968d]">
                Free-text feedback submitted by End Users is automatically scanned and redacted for common personally identifiable information patterns, including email addresses and phone numbers, before storage.
              </p>

              <h2 className="font-garamond text-2xl text-[#E0D8D0] font-light">4. AI Processing</h2>
              <p className="text-xs md:text-sm text-[#9e968d]">
                Error messages, technical context, and Fake Door feedback text are sent to our AI inference provider (Gemini / AI Studio) to generate plain-English diagnoses and sentiment summaries.
              </p>

              <h2 className="font-garamond text-2xl text-[#E0D8D0] font-light">5. Contact</h2>
              <p className="text-xs md:text-sm text-[#9e968d]">
                Questions about this Privacy Policy can be directed to{" "}
                <a href="mailto:support@grane.ai" className="underline font-semibold text-[#6C63FF]">
                  support@grane.ai
                </a>.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
