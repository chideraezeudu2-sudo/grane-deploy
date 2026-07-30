import React, { useState, useEffect } from "react";
import { User } from "./types";
import { api, getStoredToken } from "./services/api";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { DashboardShell } from "./components/DashboardShell";
import { LegalPage } from "./components/LegalPage";

export default function App() {
  const [route, setRoute] = useState<string>("landing");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);

  const checkAuth = async () => {
    const token = getStoredToken();
    if (!token) {
      setCurrentUser(null);
      setLoadingUser(false);
      return;
    }

    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
    } catch (e) {
      console.warn("Auth token invalid or expired", e);
      setCurrentUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // After a real Stripe Checkout redirect, acknowledge it and clean the URL.
    // The plan itself is set by the Stripe webhook, not by this redirect —
    // this just re-fetches the user so the new plan shows up in the UI.
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      window.history.replaceState({}, "", window.location.pathname);
      setTimeout(() => {
        checkAuth();
        alert("Your plan has been updated. Welcome to your new tier!");
      }, 1500); // small delay to give the Stripe webhook time to land
    }
  }, []);

  const handleAuthSuccess = async () => {
    await checkAuth();
    setRoute("dashboard");
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setRoute("landing");
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#E0D8D0] font-figtree flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
          <p className="font-figtree text-sm uppercase tracking-widest text-[#9e968d]">Loading Grane...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and route is dashboard, show DashboardShell
  if (currentUser && (route === "dashboard" || route === "login" || route === "signup")) {
    return (
      <DashboardShell
        user={currentUser}
        onLogout={handleLogout}
        onUserUpdated={checkAuth}
      />
    );
  }

  // Unauthenticated or explicitly routed pages
  switch (route) {
    case "signup":
      return (
        <AuthPage
          mode="signup"
          onNavigate={(r) => setRoute(r)}
          onSuccess={handleAuthSuccess}
        />
      );

    case "login":
      return (
        <AuthPage
          mode="login"
          onNavigate={(r) => setRoute(r)}
          onSuccess={handleAuthSuccess}
        />
      );

    case "tos":
      return <LegalPage type="tos" onNavigate={(r) => setRoute(r)} />;

    case "privacy":
      return <LegalPage type="privacy" onNavigate={(r) => setRoute(r)} />;

    case "dashboard":
      if (currentUser) {
        return (
          <DashboardShell
            user={currentUser}
            onLogout={handleLogout}
            onUserUpdated={checkAuth}
          />
        );
      }
      return (
        <AuthPage
          mode="login"
          onNavigate={(r) => setRoute(r)}
          onSuccess={handleAuthSuccess}
        />
      );

    case "landing":
    default:
      return (
        <LandingPage
          onNavigate={(r) => {
            if (r === "dashboard" && !currentUser) {
              setRoute("login");
            } else {
              setRoute(r);
            }
          }}
        />
      );
  }
}
