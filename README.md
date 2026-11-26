# BLITZ — Advanced Solana Terminal

A mobile-responsive front-end prototype for a Solana token discovery and sniper terminal.

## Included
- Discover, Trending, New Pairs, Sniper, Wallet Tracker, Copy Trade, Portfolio and Settings views
- Token search, filters and detail panel
- Manual paper-buy preview and auto-sniper rule configuration
- Local watchlist UI and copy-trade rule preview
- Express server with `/api/health` and `/api/status`

## Run locally
1. Install Node.js 18 or newer.
2. In this folder run `npm install`.
3. Run `npm start`.
4. Open `http://localhost:3000`.

## Deployment
This repository includes `render.yaml` for a Render web service. Push the folder to a Git repository and create a new Web Service from that repository.

## Important limitations
This is a UI prototype with fictional sample tokens and metrics. It does not connect to a live Solana feed, inspect on-chain token authorities, connect a wallet, or submit transactions. Paper previews are local UI behavior only. Do not enter seed phrases or private keys. Real execution should be added only with non-custodial wallet signing, explicit transaction approvals, spending caps, slippage controls and an emergency stop.
