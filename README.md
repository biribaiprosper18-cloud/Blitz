# BLITZ v1.3.0 — Live Charts & Market Data

## What changed
- Added a dedicated live price-chart workspace to Trending.
- Clicking a live token loads its DexScreener pair chart and a compact market overview.
- Market feed now returns pair addresses and USD prices needed by the chart view.
- Trending and New Pairs token rows are selectable.
- Live feed refreshes when the terminal starts and can be refreshed manually.
- Kept the existing wallet connection, wallet balances, and user-approved SOL transfer flow intact.
- Kept trading controls in preview mode; this release does not enable automated or live token buys/sells.

## Deploy
Upload the contents of this folder to the root of the existing GitHub repository, preserving `public/index.html` in `public/`. Commit to the branch connected to Render and wait for deployment. Check `/api/health` and confirm `version` is `1.3.0`.

Charts are embedded from DexScreener and require a returned Solana pair address. Some newly created tokens may not have a chart until a liquid pair is indexed. Never enter a seed phrase or private key into BLITZ.


Version 1.3.2 adds an iOS Safari vertical-scroll compatibility override while preserving the purple/white market UI and existing wallet/transfer code.
