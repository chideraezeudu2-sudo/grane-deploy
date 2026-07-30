import React from "react";
import { ArrowRight } from "lucide-react";

interface HeaderProps {
  onNavigate: (route: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      onNavigate("landing");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <header className="sticky top-6 z-50 px-4 max-w-6xl mx-auto">
      <div className="bg-[#0c0c0e]/90 backdrop-blur-md border border-white/15 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl shadow-black/80">
        {/* Logo */}
        <button
          onClick={() => onNavigate("landing")}
          className="text-left group cursor-pointer focus:outline-none py-1"
        >
          <span className="font-garamond text-3xl font-light tracking-tight text-[#E0D8D0] group-hover:text-white transition-colors">
            Grane
          </span>
        </button>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("features")}
            className="font-figtree text-xs uppercase tracking-[0.2em] font-medium text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("pricing")}
            className="font-figtree text-xs uppercase tracking-[0.2em] font-medium text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="font-figtree text-xs uppercase tracking-[0.2em] font-medium text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            How It Works
          </button>
        </nav>

        {/* Right CTA Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("login")}
            className="font-figtree text-xs uppercase tracking-[0.15em] font-medium text-[#E0D8D0] px-4 py-2 hover:text-white transition-colors cursor-pointer"
          >
            Log In
          </button>
          <button
            onClick={() => onNavigate("signup")}
            className="btn-primary px-5 py-2 flex items-center gap-1.5 cursor-pointer font-figtree text-xs tracking-wider uppercase font-semibold"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
