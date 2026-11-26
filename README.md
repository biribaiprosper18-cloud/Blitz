# BLITZ v0.7 — Phantom wallet connection

This release builds on v0.6 and adds a real, permission-based Phantom provider connection.

## What it does
- Detects Phantom's injected Solana provider (`window.phantom.solana` / `window.solana`)
- Requests connection only after the user clicks Connect
- On iPhone Safari, opens the current BLITZ URL in Phantom's in-app browser using Phantom's browse universal link
- Displays the connected public address and requests the public SOL balance from Solana mainnet RPC
- Supports disconnect and account-change events
- Retains the v0.6 DEX Screener market-data endpoint

## Deploy
Replace the files in the Git repository connected to your existing Render service, then commit and push. Keep the same Render service/domain.

## iPhone connection steps
1. Install/open the official Phantom app.
2. Visit BLITZ in Safari and tap Connect wallet.
3. BLITZ redirects to the same site inside Phantom's in-app browser.
4. Tap Connect wallet again and approve the connection in Phantom.

Phantom's mobile app only supports dapp connections inside its in-app browser; Safari itself cannot complete the mobile connection.

## Security / limitations
- BLITZ only requests the public wallet address and public SOL balance.
- This release does not sign messages, submit transactions, trade, or request token permissions.
- Never enter a recovery phrase or private key into BLITZ.
- The public balance read uses Solana's public mainnet RPC. For production scale, use a reliable RPC provider and rate limits.
- The market feed remains the v0.6 DEX Screener preview and is not a guaranteed low-latency launch stream.
