# BLITZ v1.2.4 — Frontend Runtime Fix

## What changed
- Fixed a startup crash caused by the minimal Home redesign removing the legacy `#search` and `#detail` elements while old JavaScript still accessed them unconditionally.
- Made optional live-feed status UI references safe when that element is absent.
- Removed a duplicate delegated click listener; the existing wallet button handlers remain the single click path.
- Preserved the wallet picker, wallet provider detection, wallet logos, wallet balance endpoint, SOL price feed, market feed and current interface.
- Backend health version updated to 1.2.4.

## Deploy
Upload the contents of this folder to the root of the existing GitHub repository, preserving `public/index.html` in the `public` folder. Commit to the branch connected to Render and wait for deployment. Then check `/api/health` and confirm `version` is `1.2.4`.

The browser-side fix addresses the confirmed missing-element runtime errors. Wallet providers still need to be available in the wallet's in-app browser or installed browser extension. Never enter a seed phrase or private key into BLITZ.
