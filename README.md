# BLITZ v1.4.0 — Individual Token Pages

This release adds individual token detail pages to the existing BLITZ terminal while preserving the purple-and-white theme and the existing wallet, balance, transfer, market-feed, and iOS scrolling code.

## What changed
- Selecting a token from Home, Trending, New Pairs, or Meme Zone opens its individual detail page.
- Detail page shows price, 24-hour change, market cap, liquidity, volume, pair age, mint address, and pair address when supplied by the market feed.
- Embedded DexScreener chart and external pair link appear when a pair address is available.
- Copy buttons for mint and pair addresses.
- Buy and Sell buttons route to Sniper's existing paper-order preview. They do not execute swaps or move funds.

## Deploy
1. Extract this ZIP.
2. Upload the contents to the existing GitHub BLITZ repository, preserving `public/index.html` in `public/`.
3. Commit to the `main` branch and wait for Render to redeploy.
4. Check `/api/health` and confirm version `1.4.0`.

The chart requires a valid pair address from the market feed and may be unavailable for tokens without a liquidity pair. The buy/sell controls are intentionally paper-only in this release.
