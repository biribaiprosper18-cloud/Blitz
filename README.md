# BLITZ v0.6 — Unified site + first live market-data connection

## What's new
- Landing page and trading workspace remain one application.
- Added server-side `/api/markets/latest` integration with the public DexScreener API.
- Home > Market discovery > **Load live feed** fetches latest Solana token profiles and enriches them with pair market cap/FDV, 24h volume, liquidity, 24h price change and pair age.
- 30-second server cache to reduce upstream requests.
- If the provider is unavailable, the UI keeps the sample feed and shows a clear error.

## Run locally
1. Install Node.js 18+.
2. Run `npm install`.
3. Run `npm start`.
4. Open `http://localhost:3000`.

## Deploy to existing Render service
Replace the repository files with this project, commit and push. Keep the current Render service and domain; trigger a deploy of that existing service.

## Data limitations
DexScreener's latest token-profiles endpoint is a discovery source, not a complete firehose of every brand-new Pump.fun launch. The current implementation only displays profile tokens for which DexScreener returns a Solana trading pair. Metrics are third-party market data and can lag or be incomplete. The app labels live-feed status and falls back to sample data if no usable results arrive.

## Not enabled yet
No Phantom wallet connection, transaction signing, automated execution, on-chain authority/rug scanner, wallet PnL analytics or copy trading is implemented. Do not enter seed phrases or private keys. Real trading requires independent transaction simulation, wallet-signed approval, spend caps, slippage limits, and an emergency stop.
