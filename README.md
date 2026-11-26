# BLITZ v0.5 — Unified site and trading workspace

This release combines the Aureon-inspired BLITZ landing page and the trading workspace into one responsive application.

## Run locally
1. Install Node.js 18+
2. Run `npm install`
3. Run `npm start`
4. Open `http://localhost:3000`

## Deploy update to Render
Upload/push this project to the Git repository connected to the existing Render service, then trigger a deploy. Keep the existing service name/domain if updating the current deployment. Do not create a second service unless you want a separate staging site.

## Included
- Landing page, responsive hero, features section
- Connect-wallet modal preview
- Mobile navigation drawer
- Trading workspace with Home, Trending, New Pairs, Sniper, Meme Zone, Wallet Tracker, Copy Trade and Portfolio
- Mobile bottom navigation and desktop sidebar

## Important limitations
The market feed uses fictional sample data. Phantom connection is a placeholder. There is no live Solana feed, on-chain scanner, wallet analytics or real trade execution. Never enter seed phrases or private keys. Add wallet-signed transactions only after security review, spending caps, slippage limits and emergency-stop controls are implemented.
