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


## SOL price feed reliability update (0.10.1)
The SOL/USD spot endpoint now tries CoinGecko, Coinbase, Kraken, then Binance. The browser refreshes every 30 seconds, shows an unavailable state instead of remaining on Loading, and the server may return a clearly marked cached value for up to 10 minutes if all providers are temporarily down. The 24-hour change is displayed only when supplied by the provider.


## Phase 1: live launch detector (0.10.1)
- A single server-side PumpPortal WebSocket connection subscribes to `subscribeNewToken` and `subscribeMigration`.
- The server relays launch events to browser clients using Server-Sent Events (SSE), with reconnect/backoff and a rolling 100-launch list.
- The New Pairs view shows live token name, symbol, mint, and initial market-cap-in-SOL field when provided by the event.
- This phase is detection only. It does not subscribe to metered token/account trade streams and cannot execute buys or sells.
- The backend uses the `ws` package; deploy with `npm install` so Render installs the new dependency.


## 0.10.1 launch-stream startup fix
The PumpPortal WebSocket client is now explicitly started when the Render server boots. The previous detector defined the connection/reconnect function but did not invoke it, leaving the public status endpoint stuck at `connecting`. Added a 12-second connection timeout and improved error/close diagnostics.


## Phase 2: Smart Token Scanner (0.10.1)
- Adds transparent launch-data completeness checks for token name, ticker, creator address, initial market-cap field, and metadata URI.
- Displays the creator address and metadata URI when present, with copy controls.
- Missing market-cap data is shown as Unavailable, not 0.00 SOL.
- These checks are data-quality indicators only. They do not determine whether a token is safe, detect honeypots, verify liquidity/holders, or predict price performance.
- No buy/sell execution or transaction signing is added.


## SOL transfer (0.10.1)
- Adds a Send SOL panel to Wallet Tracker.
- Builds a native SOL transfer transaction in the browser using Solana web3.js, estimates the fee and checks balance before requesting Phantom approval.
- Keeps a 0.00001 SOL reserve plus the estimated network fee.
- Requires explicit confirmation in BLITZ and transaction approval in Phantom; BLITZ never handles private keys or recovery phrases.
- Uses Solana mainnet and links confirmed transactions to Solscan.
- This is a native SOL transfer only; it does not transfer SPL tokens.


## 0.10.1 transfer RPC fix
The browser no longer calls the public Solana mainnet RPC directly (which returned HTTP 403 in the user's environment). Transfer preparation now calls the same-origin `/api/solana/rpc` server proxy, which uses the configured `SOLANA_RPC_URL` first and public fallback endpoints second. The proxy allowlists only `getLatestBlockhash`, `getFeeForMessage`, and `getBalance`; signed transaction submission remains handled by Phantom.
For production reliability, set `SOLANA_RPC_URL` in Render to a Solana mainnet RPC endpoint you control or subscribe to. Never put the provider URL/API key in frontend code or public GitHub files.
