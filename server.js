const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));

// Small in-memory cache prevents repeated upstream requests while users refresh.
let marketCache = { at: 0, tokens: null };
const CACHE_MS = 30_000;



let solPriceCache = { at: 0, data: null };
app.get('/api/sol-price', async (_req, res) => {
  const errors = [];
  const providers = [
    {
      name: 'CoinGecko',
      url: 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true',
      parse: j => ({ price: Number(j?.solana?.usd), change24h: Number(j?.solana?.usd_24h_change || 0) })
    },
    {
      name: 'Coinbase',
      url: 'https://api.coinbase.com/v2/prices/SOL-USD/spot',
      parse: j => ({ price: Number(j?.data?.amount), change24h: null })
    },
    {
      name: 'Kraken',
      url: 'https://api.kraken.com/0/public/Ticker?pair=SOLUSD',
      parse: j => {
        const result = j?.result || {};
        const ticker = Object.values(result)[0];
        return { price: Number(ticker?.c?.[0]), change24h: null };
      }
    },
    {
      name: 'Binance',
      url: 'https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT',
      parse: j => ({ price: Number(j?.price), change24h: null })
    }
  ];

  for (const provider of providers) {
    try {
      const response = await fetch(provider.url, {
        headers: { 'accept': 'application/json', 'user-agent': 'BLITZ-terminal/0.7.5' },
        signal: AbortSignal.timeout(7000)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const parsed = provider.parse(payload);
      if (!Number.isFinite(parsed.price) || parsed.price <= 0) throw new Error('Invalid price response');
      const data = { price: parsed.price, change24h: parsed.change24h, source: provider.name };
      solPriceCache = { at: Date.now(), data };
      res.set('Cache-Control', 'no-store');
      return res.json({ ...data, cached: false, updatedAt: solPriceCache.at });
    } catch (error) {
      errors.push(`${provider.name}: ${error.message}`);
    }
  }

  // If every provider is temporarily unavailable, return a recent cached value
  // with its timestamp rather than leaving the dashboard stuck on "Loading".
  if (solPriceCache.data && Date.now() - solPriceCache.at < 10 * 60_000) {
    return res.json({ ...solPriceCache.data, cached: true, stale: true, updatedAt: solPriceCache.at });
  }
  res.status(502).json({
    error: 'All live SOL price providers failed',
    detail: errors.join(' | ')
  });
});

app.get('/api/health', (_req, res) => res.json({ ok: true, app: 'BLITZ', version: '0.7.5', mode: 'market-data-preview' }));

app.get('/api/markets/latest', async (_req, res) => {
  try {
    if (marketCache.tokens && Date.now() - marketCache.at < CACHE_MS) {
      return res.json({ source: 'DexScreener', cached: true, updatedAt: marketCache.at, tokens: marketCache.tokens });
    }
    const profilesResponse = await fetch('https://api.dexscreener.com/token-profiles/latest/v1', {
      headers: { 'accept': 'application/json', 'user-agent': 'BLITZ-terminal/0.6' },
      signal: AbortSignal.timeout(12_000)
    });
    if (!profilesResponse.ok) throw new Error(`DexScreener profiles returned ${profilesResponse.status}`);
    const profiles = await profilesResponse.json();
    const solanaProfiles = (Array.isArray(profiles) ? profiles : [])
      .filter(p => p && p.chainId === 'solana' && p.tokenAddress)
      .slice(0, 30);
    if (!solanaProfiles.length) throw new Error('No Solana token profiles returned');
    const addresses = [...new Set(solanaProfiles.map(p => p.tokenAddress))].slice(0, 30);
    const pairsResponse = await fetch(`https://api.dexscreener.com/tokens/v1/solana/${addresses.join(',')}`, {
      headers: { 'accept': 'application/json', 'user-agent': 'BLITZ-terminal/0.6' },
      signal: AbortSignal.timeout(12_000)
    });
    if (!pairsResponse.ok) throw new Error(`DexScreener token lookup returned ${pairsResponse.status}`);
    const pairs = await pairsResponse.json();
    const profileByAddress = new Map(solanaProfiles.map(p => [p.tokenAddress, p]));
    const bestByToken = new Map();
    for (const pair of (Array.isArray(pairs) ? pairs : [])) {
      const address = pair?.baseToken?.address;
      if (!address) continue;
      const old = bestByToken.get(address);
      const liquidity = Number(pair?.liquidity?.usd || 0);
      if (!old || liquidity > Number(old?.liquidity?.usd || 0)) bestByToken.set(address, pair);
    }
    const tokens = addresses.map(address => {
      const pair = bestByToken.get(address);
      const profile = profileByAddress.get(address) || {};
      if (!pair) return null;
      const created = Number(pair.pairCreatedAt || 0);
      const ageMs = created ? Math.max(0, Date.now() - created) : 0;
      const age = ageMs ? (ageMs < 3_600_000 ? `${Math.max(1, Math.floor(ageMs / 60_000))}m` : `${Math.floor(ageMs / 3_600_000)}h`) : '—';
      return {
        address,
        name: pair.baseToken?.name || profile.description?.slice(0, 36) || 'Unknown token',
        symbol: pair.baseToken?.symbol || '—',
        marketCap: pair.marketCap || pair.fdv || 0,
        volume24h: pair.volume?.h24 || 0,
        liquidity: pair.liquidity?.usd || 0,
        change24h: pair.priceChange?.h24 || 0,
        age,
        url: pair.url || profile.url || ''
      };
    }).filter(Boolean).sort((a, b) => b.volume24h - a.volume24h);
    if (!tokens.length) throw new Error('Profiles found, but no matching Solana trading pairs were available');
    marketCache = { at: Date.now(), tokens };
    res.json({ source: 'DexScreener', cached: false, updatedAt: marketCache.at, tokens });
  } catch (error) {
    res.status(502).json({ error: 'Live Solana market feed is temporarily unavailable', detail: error.message });
  }
});


// Public, read-only wallet portfolio endpoint. No signing or private keys are involved.
app.get('/api/wallet/:address', async (req, res) => {
  const address = String(req.params.address || '');
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Solana public address' });
  }

  // Public read-only RPC endpoints. Try a fallback if the first endpoint is rate-limited.
  const rpcUrls = [
    process.env.SOLANA_RPC_URL,
    'https://api.mainnet-beta.solana.com',
    'https://solana-rpc.publicnode.com'
  ].filter(Boolean);

  async function rpc(method, params) {
    let lastError;
    for (const url of rpcUrls) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
          signal: AbortSignal.timeout(12000)
        });
        if (!response.ok) throw new Error(`RPC HTTP ${response.status}`);
        const payload = await response.json();
        if (payload.error) throw new Error(payload.error.message || 'Solana RPC error');
        return payload.result;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error('All Solana RPC endpoints failed');
  }

  try {
    const tokenPrograms = [
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
    ];
    const [balance, legacyAccounts, token2022Accounts] = await Promise.all([
      rpc('getBalance', [address, { commitment: 'confirmed' }]),
      rpc('getTokenAccountsByOwner', [
        address, { programId: tokenPrograms[0] },
        { encoding: 'jsonParsed', commitment: 'confirmed' }
      ]),
      rpc('getTokenAccountsByOwner', [
        address, { programId: tokenPrograms[1] },
        { encoding: 'jsonParsed', commitment: 'confirmed' }
      ]).catch(() => ({ value: [] }))
    ]);

    const tokens = [...(legacyAccounts?.value || []), ...(token2022Accounts?.value || [])]
      .map(item => {
        const info = item.account?.data?.parsed?.info;
        const amount = info?.tokenAmount;
        return {
          mint: info?.mint || '',
          amount: amount?.uiAmountString || '0',
          decimals: amount?.decimals ?? 0,
          rawAmount: amount?.amount || '0'
        };
      })
      .filter(t => t.mint && t.rawAmount !== '0')
      .slice(0, 200);

    res.set('Cache-Control', 'no-store');
    res.json({
      address,
      sol: Number(balance?.value || 0) / 1e9,
      lamports: Number(balance?.value || 0),
      tokenCount: tokens.length,
      tokens,
      rpcStatus: 'ok',
      updatedAt: Date.now()
    });
  } catch (error) {
    res.status(502).json({
      error: 'Solana RPC could not return this wallet balance',
      detail: error.message,
      hint: 'Try again in a few seconds. Public RPC endpoints can be rate-limited.'
    });
  }
});

app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(port, () => console.log(`BLITZ running on port ${port}`));
