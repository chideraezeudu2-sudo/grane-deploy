import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

import authRoutes from "../routes/auth.js";
import eventsRoutes from "../routes/events.js";
import fakeDoorsRoutes from "../routes/fakeDoors.js";
import analyticsRoutes from "../routes/analytics.js";
import usageRoutes from "../routes/usage.js";
import billingRoutes from "../routes/billing.js";
import userRoutes from "../routes/user.js";

// Set environment for Vercel
process.env.VERCEL = "1";
process.env.NODE_ENV = "production";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Stripe webhook needs raw body - must be before express.json()
app.use("/api/billing/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

// Rate limiting
const generalLimiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
app.use("/api", generalLimiter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

// Widget script
app.get("/widget.js", (req, res) => {
  res.type("application/javascript");
  res.sendFile(path.join(process.cwd(), "widget", "apppulse.js"));
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/fake-doors", fakeDoorsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/usage", usageRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/user", userRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// Vercel serverless handler
export default app;
