# BLITZ v0.7.3 — Wallet connection and balance reliability

## Fixes
- Solana wallet balance API now tries a primary RPC and a fallback RPC endpoint.
- Supports both legacy SPL Token and Token-2022 accounts.
- Adds a Refresh button in Portfolio so balances can be reloaded without disconnecting.
- Explicit Node.js 20+ runtime requirement for Render.
- Better error messaging when public RPC endpoints are rate-limited.

## Deploy to the existing Render service
1. Extract this ZIP.
2. Replace all files in the GitHub repository connected to the existing Render service.
3. Commit and push; wait for Render to finish deploying.
4. Open `https://YOUR-EXISTING-DOMAIN/api/health` and confirm version `0.7.3`.
5. Open the site inside Phantom's in-app browser on iPhone, connect, then open Portfolio and tap Refresh.

## Optional production RPC
For more reliable requests, add a Render environment variable named `SOLANA_RPC_URL` with an RPC URL from a provider you trust. Keep the URL private if it contains an API key. The app falls back to public RPC endpoints if this variable is not set.

## Scope and security
- Reads actual public on-chain SOL and SPL/Token-2022 balances.
- Does not calculate full USD portfolio value yet.
- Does not request signatures or send transactions.
- Never enter or share a seed phrase or private key.


## Visual update
BLITZ now uses a dark charcoal and neon-green accent palette. Wallet connection and balance functionality are unchanged.


## Live SOL price
The home dashboard fetches SOL/USD from CoinGecko, with Binance SOL/USDT as a fallback, caches responses for 30 seconds, and refreshes the displayed price every 60 seconds. The displayed percentage is the provider's 24-hour change. This is a market reference price, not an executable quote.


## SOL price feed reliability update (0.7.5)
The SOL/USD spot endpoint now tries CoinGecko, Coinbase, Kraken, then Binance. The browser refreshes every 30 seconds, shows an unavailable state instead of remaining on Loading, and the server may return a clearly marked cached value for up to 10 minutes if all providers are temporarily down. The 24-hour change is displayed only when supplied by the provider.
