# BLITZ v1.5.0 — Jupiter Swap V2

This release builds on BLITZ v1.4.0 and adds wallet-approved Jupiter swaps from individual token pages.

## Features
- Jupiter Swap API V2 `/order` quote + unsigned transaction endpoint.
- Jupiter `/execute` managed landing endpoint.
- Buy selected token with SOL.
- Sell selected token for SOL (enter the token amount and its decimals; token decimals are not inferred automatically).
- Transaction signing stays in the connected wallet provider. BLITZ never requests or stores seed phrases/private keys.
- Solscan transaction link when Jupiter returns a signature.
- Server-side API proxy; Jupiter API key is never exposed in browser code.

## Deploy
1. Extract the ZIP.
2. Upload the contents into the existing `Blitz` GitHub repository, preserving `public/index.html`.
3. Commit to `main` and wait for Render to deploy.
4. In Render, optionally add `JUPITER_API_KEY` as an environment variable (recommended for production rate limits). Do not put the key in `index.html` or commit it to GitHub.
5. Check `/api/health`; it should report version `1.5.0`.

Jupiter keyless requests are heavily rate-limited and intended for light prototyping. Create a key in the Jupiter Developer Portal for production use.

## Important trading notes
- Real mainnet transactions can lose funds. Verify the token mint, route, output amount, fees and token risks before approving.
- Jupiter provides real-time slippage estimation on `/order`; this UI does not override it.
- The Sell flow requires the user to enter the token's correct decimals. An incorrect decimals value changes the amount being sold. Verify decimals from a trusted token source before proceeding.
- Only use a wallet provider that supports `signTransaction` for the returned versioned transaction. Wallet compatibility can vary, especially in mobile in-app browsers.
- A quote is not a guarantee of execution. Prices and liquidity can change before signing.
- The `/execute` endpoint only accepts signed transactions returned by Jupiter `/order`.
- This release has passed local JavaScript syntax checks. Live mainnet swap testing still needs to be performed with a small amount after deployment.
