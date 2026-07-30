import React from "react";

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#050505] text-[#E0D8D0] mt-24 pt-16 pb-12 px-6 border-t border-white/10 font-figtree">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <span className="font-garamond text-3xl font-light tracking-tight text-[#E0D8D0]">
              Grane
            </span>
          </div>
          <p className="font-figtree text-xs text-[#9e968d] leading-relaxed">
            Product intelligence engine for modern SaaS apps.
          </p>
        </div>

        {/* Product Column */}
        <div>
          <h4 className="font-figtree text-[10px] uppercase tracking-[0.3em] font-semibold text-white/40 mb-4">
            Product
          </h4>
          <ul className="space-y-2.5 font-figtree text-xs text-white/70">
            <li>
              <a href="#features" className="hover:text-white transition-colors">
                Features
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-white transition-colors">
                Pricing
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-white transition-colors">
                How It Works
              </a>
            </li>
          </ul>
        </div>

        {/* Legal Column */}
        <div>
          <h4 className="font-figtree text-[10px] uppercase tracking-[0.3em] font-semibold text-white/40 mb-4">
            Legal
          </h4>
          <ul className="space-y-2.5 font-figtree text-xs text-white/70">
            <li>
              <button
                onClick={() => onNavigate("tos")}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Terms of Service
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate("privacy")}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Privacy Policy
              </button>
            </li>
          </ul>
        </div>

        {/* Company Column */}
        <div>
          <h4 className="font-figtree text-[10px] uppercase tracking-[0.3em] font-semibold text-white/40 mb-4">
            Company
          </h4>
          <ul className="space-y-2.5 font-figtree text-xs text-white/70">
            <li>
              <a
                href="mailto:support@grane.ai"
                className="hover:text-white transition-colors underline"
              >
                support@grane.ai
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-[11px] text-white/40 font-figtree">
        <p>© 2026 Grane. All rights reserved.</p>
        <p className="mt-2 sm:mt-0">Built for product-led growth and founder clarity.</p>
      </div>
    </footer>
  );
};
