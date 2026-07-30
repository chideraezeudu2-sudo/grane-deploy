import React, { useState } from "react";
import { ArrowRight, AlertCircle } from "lucide-react";
import { api } from "../services/api";

interface AuthPageProps {
  mode: "signup" | "login";
  onNavigate: (route: string) => void;
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onNavigate, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Client side quick validations
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (mode === "signup" && password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        await api.signup(email, password);
      } else {
        await api.login(email, password);
      }
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0D8D0] font-figtree flex flex-col justify-between p-6">
      {/* Top logo */}
      <div className="max-w-md w-full mx-auto pt-6">
        <button
          onClick={() => onNavigate("landing")}
          className="text-left cursor-pointer focus:outline-none"
        >
          <span className="font-garamond text-3xl font-light tracking-tight text-[#E0D8D0] hover:text-white transition-colors">
            Grane
          </span>
        </button>
      </div>

      {/* Form Container */}
      <div className="max-w-md w-full mx-auto my-12">
        <div className="card-cream border border-white/15 p-8 md:p-10 shadow-2xl shadow-black/80">
          <div className="mb-8 text-center">
            <h1 className="font-garamond text-3xl md:text-4xl font-light text-[#E0D8D0] mb-2">
              {mode === "signup" ? "Create your account" : "Log in to Grane"}
            </h1>
            <p className="font-figtree text-xs text-[#9e968d]">
              {mode === "signup"
                ? "Get started in under two minutes."
                : "Welcome back! Enter your details to continue."}
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-amber-500/10 text-[#E0D8D0] rounded-xl border border-amber-500/30 flex items-start gap-3 text-xs md:text-sm">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span>{errorMsg}</span>
                {errorMsg.includes("already exists") && (
                  <button
                    type="button"
                    onClick={() => onNavigate("login")}
                    className="ml-2 font-bold underline text-white cursor-pointer"
                  >
                    Log in instead
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-figtree text-xs uppercase tracking-[0.15em] font-medium text-white/60 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 bg-[#000000] border border-white/15 rounded-xl font-figtree text-sm text-[#E0D8D0] placeholder-white/20 focus:outline-none focus:border-white/40"
              />
            </div>

            <div>
              <label className="block font-figtree text-xs uppercase tracking-[0.15em] font-medium text-white/60 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#000000] border border-white/15 rounded-xl font-figtree text-sm text-[#E0D8D0] placeholder-white/20 focus:outline-none focus:border-white/40"
              />
              {mode === "signup" && (
                <p className="text-[11px] text-[#9e968d] mt-1 font-figtree">At least 8 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{loading ? "Processing..." : mode === "signup" ? "Get Started" : "Log In"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {mode === "signup" && (
            <p className="text-[11px] text-[#9e968d] text-center mt-6 leading-relaxed">
              By signing up, you agree to our{" "}
              <button onClick={() => onNavigate("tos")} className="underline text-[#E0D8D0] font-medium cursor-pointer">
                Terms of Service
              </button>{" "}
              and{" "}
              <button onClick={() => onNavigate("privacy")} className="underline text-[#E0D8D0] font-medium cursor-pointer">
                Privacy Policy
              </button>
              .
            </p>
          )}

          <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs font-figtree text-[#9e968d]">
            {mode === "signup" ? (
              <span>
                Already have an account?{" "}
                <button
                  onClick={() => onNavigate("login")}
                  className="font-bold underline text-white hover:text-white/80 cursor-pointer"
                >
                  Log In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{" "}
                <button
                  onClick={() => onNavigate("signup")}
                  className="font-bold underline text-white hover:text-white/80 cursor-pointer"
                >
                  Get Started
                </button>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-[11px] text-white/40 pb-6">
        © 2026 Grane. All rights reserved.
      </div>
    </div>
  );
};
