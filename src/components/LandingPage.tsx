import React from "react";
import { ArrowRight, Check, Sparkles, Bug, MessageSquare, AlertTriangle, ShieldCheck, Copy } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('<script src="https://cdn.grane.ai/widget.js" data-app-id="your-app-id" data-api-url="https://your-grane-backend.com"></script>');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0D8D0] font-figtree selection:bg-white selection:text-black">
      {/* Sticky Header */}
      <Header onNavigate={onNavigate} />

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-6 max-w-5xl mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/15 font-figtree text-xs uppercase tracking-[0.2em] text-[#E0D8D0] mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#6C63FF]" />
          <span>Product Intelligence Engine</span>
        </div>

        {/* H1 Headline */}
        <h1 className="font-garamond text-5xl md:text-7xl lg:text-8xl font-light leading-[0.98] tracking-tight text-[#E0D8D0] mb-8">
          Stop guessing what users want and <span className="italic font-light text-white underline decoration-white/30 decoration-1">what's breaking.</span>
        </h1>

        {/* Subheadline */}
        <p className="font-figtree text-lg md:text-2xl text-[#9e968d] max-w-3xl mx-auto leading-relaxed mb-10">
          Grane watches your app, translates errors into plain English, and tells you exactly which features to build next — so you spend less time debugging and more time building.
        </p>

        {/* Primary CTA */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => onNavigate("signup")}
            className="btn-primary text-base md:text-lg px-8 py-4 font-semibold flex items-center gap-3 cursor-pointer tracking-wide"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <a
            href="#how-it-works"
            className="text-xs uppercase tracking-[0.2em] font-medium text-white/40 hover:text-white transition-colors underline cursor-pointer"
          >
            See how it works ↓
          </a>

          <p className="text-xs text-white/40 font-figtree mt-2">
            Built for solo founders and indie hackers. 500 free events/month, forever.
          </p>
        </div>
      </section>

      {/* Section 2: "The Problem" */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
            The Problem
          </span>
          <h2 className="font-garamond text-4xl md:text-6xl font-light text-[#E0D8D0] mt-2">
            You're flying blind.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="card-cream">
            <div className="w-10 h-10 rounded-full bg-white/10 text-[#E0D8D0] border border-white/20 flex items-center justify-center font-serif text-lg mb-6">
              01
            </div>
            <h3 className="font-garamond text-2xl md:text-3xl font-normal text-[#E0D8D0] mb-3">
              Bugs go unreported
            </h3>
            <p className="font-figtree text-sm text-[#9e968d] leading-relaxed">
              Most users who hit an error just leave. They don't file a bug report. You find out weeks later, if at all.
            </p>
          </div>

          {/* Card 2 */}
          <div className="card-cream">
            <div className="w-10 h-10 rounded-full bg-white/10 text-[#E0D8D0] border border-white/20 flex items-center justify-center font-serif text-lg mb-6">
              02
            </div>
            <h3 className="font-garamond text-2xl md:text-3xl font-normal text-[#E0D8D0] mb-3">
              Feedback is vague
            </h3>
            <p className="font-figtree text-sm text-[#9e968d] leading-relaxed">
              "It's broken" doesn't tell you what's broken, why, or how to fix it. You're left guessing.
            </p>
          </div>

          {/* Card 3 */}
          <div className="card-cream">
            <div className="w-10 h-10 rounded-full bg-white/10 text-[#E0D8D0] border border-white/20 flex items-center justify-center font-serif text-lg mb-6">
              03
            </div>
            <h3 className="font-garamond text-2xl md:text-3xl font-normal text-[#E0D8D0] mb-3">
              You build the wrong things
            </h3>
            <p className="font-figtree text-sm text-[#9e968d] leading-relaxed">
              Weeks of work on a feature nobody wanted. There was no way to know until it shipped.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: "How It Works" */}
      <section id="how-it-works" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="card-dark border border-white/15 p-8 md:p-16">
          <div className="text-center mb-16">
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
              Setup in minutes
            </span>
            <h2 className="font-garamond text-4xl md:text-6xl font-light text-[#E0D8D0] mt-2">
              Three steps. Five minutes to set up.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-sans tracking-[0.3em] text-white/50">Step 01</span>
              <h3 className="font-garamond text-2xl text-[#E0D8D0]">Paste one line of code</h3>
              <p className="font-figtree text-xs text-[#9e968d] leading-relaxed">
                Add our widget to your app with a single script tag. No SDK, no config files, no backend changes.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] uppercase font-sans tracking-[0.3em] text-white/50">Step 02</span>
              <h3 className="font-garamond text-2xl text-[#E0D8D0]">We watch, you don't have to</h3>
              <p className="font-figtree text-xs text-[#9e968d] leading-relaxed">
                The widget quietly detects crashes, rage-clicks, and confusing pages — then asks users what happened, right when it happens.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] uppercase font-sans tracking-[0.3em] text-white/50">Step 03</span>
              <h3 className="font-garamond text-2xl text-[#E0D8D0]">Get plain-English answers</h3>
              <p className="font-figtree text-xs text-[#9e968d] leading-relaxed">
                Our AI translates the raw error into something you can actually act on. No more digging through stack traces to figure out what broke.
              </p>
            </div>
          </div>

          {/* Snippet Block */}
          <div className="bg-[#000000] border border-white/15 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-white/80">
            <code className="break-all text-white/80">
              &lt;script src="https://cdn.grane.ai/widget.js" data-app-id="your-app-id" data-api-url="https://your-grane-backend.com"&gt;&lt;/script&gt;
            </code>
            <button
              onClick={handleCopyCode}
              className="btn-secondary px-4 py-2 text-xs flex items-center gap-1.5 shrink-0 cursor-pointer font-sans"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#6C63FF]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Snippet"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Section 4: "Fake Door" Feature Spotlight */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="card-cream border border-white/15 rounded-[32px] p-8 md:p-16 bg-gradient-to-br from-[#0d0d0f] to-[#15151a]">
          <div className="max-w-3xl">
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6C63FF]">
              Core Differentiator
            </span>
            <h2 className="font-garamond text-4xl md:text-6xl font-light text-[#E0D8D0] mt-2 mb-6">
              Validate features before you build them.
            </h2>
            <p className="font-figtree text-base md:text-lg text-[#9e968d] leading-relaxed mb-6">
              Building the wrong feature costs you weeks. Grane's Fake Door tool lets you test demand first — add a button for a feature that doesn't exist yet, see who clicks, read what they say, and get an AI-scored priority rating. Build what people actually want, not what you assume they want.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/15 text-xs text-[#E0D8D0]">
              <Check className="w-3.5 h-3.5 text-[#6C63FF]" />
              <span>Available on every plan, including Free.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Feature Grid */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-garamond text-4xl md:text-5xl font-light text-[#E0D8D0]">
            Everything you need to stop flying blind.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card-cream flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-white/5 text-[#E0D8D0] border border-white/15 flex items-center justify-center shrink-0">
              <Bug className="w-5 h-5 text-[#6C63FF]" />
            </div>
            <div>
              <h3 className="font-figtree font-semibold text-lg text-[#E0D8D0] mb-1">Crash Detection</h3>
              <p className="font-figtree text-xs text-[#9e968d]">
                Automatic JavaScript error capture, no manual reporting needed.
              </p>
            </div>
          </div>

          <div className="card-cream flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-white/5 text-[#E0D8D0] border border-white/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-figtree font-semibold text-lg text-[#E0D8D0] mb-1">Rage-Click Detection</h3>
              <p className="font-figtree text-xs text-[#9e968d]">
                Know when users are frustrated, even if they never say anything.
              </p>
            </div>
          </div>

          <div className="card-cream flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-white/5 text-[#E0D8D0] border border-white/15 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-[#6C63FF]" />
            </div>
            <div>
              <h3 className="font-figtree font-semibold text-lg text-[#E0D8D0] mb-1">Long-Pause Tracking</h3>
              <p className="font-figtree text-xs text-[#9e968d]">
                Catch confusion on your most critical pages (checkout, signup, pricing).
              </p>
            </div>
          </div>

          <div className="card-cream flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-white/5 text-[#E0D8D0] border border-white/15 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#6C63FF]" />
            </div>
            <div>
              <h3 className="font-figtree font-semibold text-lg text-[#E0D8D0] mb-1">Privacy-First</h3>
              <p className="font-figtree text-xs text-[#9e968d]">
                Names, emails, and phone numbers are automatically redacted from all feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Pricing */}
      <section id="pricing" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
            Pricing
          </span>
          <h2 className="font-garamond text-4xl md:text-6xl font-light text-[#E0D8D0] mt-2">
            Simple pricing. No surprises.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="card-cream flex flex-col justify-between">
            <div>
              <h3 className="font-figtree font-bold text-2xl text-[#E0D8D0]">Free</h3>
              <div className="my-4">
                <span className="font-garamond text-5xl font-light text-[#E0D8D0]">$0</span>
                <span className="text-xs text-white/40"> / month</span>
              </div>
              <ul className="space-y-3 font-figtree text-xs text-[#9e968d] my-6">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#6C63FF]" /> 500 events/month
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#6C63FF]" /> 7-day data retention
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#6C63FF]" /> 1 active Fake Door
                </li>
                <li className="flex items-center gap-2 text-white/30 line-through">
                  No AI diagnosis
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate("signup")}
              className="btn-secondary w-full py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Basic Plan */}
          <div className="card-cream border border-white/30 relative flex flex-col justify-between bg-white/[0.05]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-0.5 rounded-full">
              Most Popular
            </div>
            <div>
              <h3 className="font-figtree font-bold text-2xl text-[#E0D8D0]">Basic</h3>
              <div className="my-4">
                <span className="font-garamond text-5xl font-light text-[#E0D8D0]">$20</span>
                <span className="text-xs text-white/40"> / month</span>
              </div>
              <ul className="space-y-3 font-figtree text-xs text-[#E0D8D0] my-6">
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-3.5 h-3.5 text-[#6C63FF]" /> 5,000 events/month
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#6C63FF]" /> 30-day data retention
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#6C63FF]" /> 3 active Fake Doors + AI sentiment
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#6C63FF]" /> AI crash translation
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate("signup")}
              className="btn-primary w-full py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Pro Plan */}
          <div className="card-cream flex flex-col justify-between">
            <div>
              <h3 className="font-figtree font-bold text-2xl text-[#E0D8D0]">Pro</h3>
              <div className="my-4">
                <span className="font-garamond text-5xl font-light text-[#E0D8D0]">$50</span>
                <span className="text-xs text-white/40"> / month</span>
              </div>
              <ul className="space-y-3 font-figtree text-xs text-[#9e968d] my-6">
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-3.5 h-3.5 text-[#6C63FF]" /> 25,000 events/month
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#6C63FF]" /> 90-day data retention
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#6C63FF]" /> Unlimited Fake Doors + AI sentiment
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#6C63FF]" /> AI crash + AI UX friction translation
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate("signup")}
              className="btn-secondary w-full py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-white/40 font-figtree mt-8">
          Upgrade or downgrade anytime from your dashboard. No contracts.
        </p>
      </section>

      {/* Section 7: Final CTA */}
      <section className="py-24 px-6 max-w-5xl mx-auto text-center">
        <div className="card-dark border border-white/20 p-12 md:p-20 bg-gradient-to-b from-[#0c0c0e] to-[#050505]">
          <h2 className="font-garamond text-5xl md:text-7xl font-light text-[#E0D8D0] mb-6">
            Stop guessing. Start watching.
          </h2>
          <p className="font-figtree text-base md:text-xl text-[#9e968d] mb-8">
            Set up in under five minutes.
          </p>
          <button
            onClick={() => onNavigate("signup")}
            className="btn-primary text-base md:text-lg px-8 py-4 font-semibold inline-flex items-center gap-3 cursor-pointer tracking-wide"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};
