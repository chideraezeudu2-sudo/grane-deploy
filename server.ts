import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.js";
import eventsRoutes from "./routes/events.js";
import fakeDoorsRoutes from "./routes/fakeDoors.js";
import analyticsRoutes from "./routes/analytics.js";
import usageRoutes from "./routes/usage.js";
import billingRoutes from "./routes/billing.js";
import userRoutes from "./routes/user.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ------------------------------------------------------------------
// CORS — the widget and Fake Door click button run on the AppPulse
// customer's own domain (not ours), so those specific public endpoints
// must accept any origin. Authenticated routes are still protected by
// JWT + Supabase RLS regardless of origin, so this is not a security gap.
// ------------------------------------------------------------------
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Stripe webhook needs the raw body — mounted before express.json().
app.use("/api/billing/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

// General rate limiting: 100 requests/min/IP.
const generalLimiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
app.use("/api", generalLimiter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

// ------------------------------------------------------------------
// Widget script — served dynamically so the snippet shown in the
// dashboard (`${window.location.origin}/widget.js`) works without
// needing a separate CDN deploy step for local/self-hosted setups.
// For production at scale, this can instead be uploaded to a real CDN
// and the dashboard's snippet URL updated accordingly — nothing else
// about the widget's behavior needs to change either way.
// ------------------------------------------------------------------
app.get("/widget.js", (req, res) => {
  res.type("application/javascript");
  res.sendFile(path.join(__dirname, "widget", "apppulse.js"));
});

// ------------------------------------------------------------------
// API routes — all backed by real Supabase (Postgres + Auth + RLS),
// Groq (AI inference), and Stripe (billing). No in-memory storage,
// no mock data, no plaintext passwords.
// ------------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/fake-doors", fakeDoorsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/usage", usageRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/user", userRoutes);

// Central error handler.
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      // Don't swallow API/widget 404s into the SPA fallback.
      if (req.path.startsWith("/api/") || req.path === "/widget.js") {
        return res.status(404).json({ error: "Not found" });
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Grane backend + frontend running on http://localhost:${PORT}`);
  });
}

startServer();
