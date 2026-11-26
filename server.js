const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));

// Small in-memory cache prevents repeated upstream requests while users refresh.
let marketCache = { at: 0, tokens: null };
const CACHE_MS = 30_000;

app.get('/api/health', (_req, res) => res.json({ ok: true, app: 'BLITZ', version: '0.6.0', mode: 'market-data-preview' }));

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

app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(port, () => console.log(`BLITZ running on port ${port}`));
