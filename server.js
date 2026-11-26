const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "public")));
app.get("/api/health", (_req, res) => res.json({ ok: true, app: "BLITZ", mode: "demo" }));
app.get("/api/status", (_req, res) => res.json({
  mode: "paper",
  liveDataConnected: false,
  walletSigningEnabled: false,
  executionEnabled: false,
  message: "Demo build. No live trading or wallet connection."
}));
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`BLITZ running on port ${PORT}`));
