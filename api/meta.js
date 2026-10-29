const { getJSON } = require('./_util');
// Live meta built from the official API: battle logs of top global players,
// tallied into win rates per map and per mode. Cached at the edge for 3 hours.
const base = () => process.env.BS_API_BASE || 'https://bsproxy.royaleapi.dev/v1';
async function pool(items, n, fn) { const out = []; let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; try { out[k] = await fn(items[k]); } catch { out[k] = null; } } })); return out; }
module.exports = async (req, res) => {
  const key = process.env.BS_API_KEY;
  if (!key) return res.status(503).json({ error: 'Server is missing its Brawl Stars API key (BS_API_KEY).' });
  const H = { Authorization: `Bearer ${key}` };
  const t0 = Date.now();
  try {
    const top = await getJSON(`${base()}/rankings/global/players?limit=200`, H);
    const tags = (top.items || []).map(p => p.tag.replace('#', '')).slice(0, 120);
    const logs = await pool(tags, 20, async t => { if (Date.now() - t0 > 10000) return null; return getJSON(`${base()}/players/%23${t}/battlelog`, H); });
    const maps = {}, modes = {}, seen = new Set();
    const add = (bucket, k, id, win) => { const m = bucket[k] || (bucket[k] = {}); const s = m[id] || (m[id] = [0, 0]); s[1]++; if (win) s[0]++; };
    for (const log of logs) for (const it of (log && log.items) || []) {
      const ev = it.event || {}, b = it.battle || {}; if (!ev.id || !ev.map) continue;
      const uid = it.battleTime + '|' + ev.id + '|' + JSON.stringify((b.teams || b.players || []).flat().map(p => p.tag).sort()).slice(0, 80);
      if (seen.has(uid)) continue; seen.add(uid);
      const mode = ev.mode || b.mode;
      if (b.teams && (b.result === 'victory' || b.result === 'defeat')) {
        const me = (b.teams || []).findIndex(tm => tm.some(p => tags.includes(p.tag.replace('#', ''))));
        b.teams.forEach((tm, ti) => { const win = ti === me ? b.result === 'victory' : b.result === 'defeat'; if (me < 0) return; for (const p of tm) { const id = p.brawler && p.brawler.id; if (id) { add(maps, ev.id, id, win); add(modes, mode, id, win); } } });
      } else if (b.rank && b.players) {
        const win = b.rank <= (mode === 'duoShowdown' ? 2 : 4);
        const meP = b.players.find(p => tags.includes(p.tag.replace('#', '')));
        if (meP && meP.brawler) { add(maps, ev.id, meP.brawler.id, win); add(modes, mode, meP.brawler.id, win); }
      }
    }
    const fin = bucket => Object.fromEntries(Object.entries(bucket).map(([k, m]) => {
      const total = Object.values(m).reduce((a, s) => a + s[1], 0);
      return [k, Object.entries(m).filter(([, s]) => s[1] >= 3).map(([id, s]) => ({ brawler: +id, winRate: +(100 * (s[0] + 1) / (s[1] + 2)).toFixed(1), useRate: +(100 * s[1] / Math.max(1, total)).toFixed(1), games: s[1] }))];
    }));
    res.setHeader('Cache-Control', 's-maxage=10800, stale-while-revalidate=86400');
    res.json({ source: 'top-player battle logs', players: logs.filter(Boolean).length, battles: seen.size, maps: fin(maps), modes: fin(modes), fetchedAt: new Date().toISOString() });
  } catch (e) { res.status(502).json({ error: `Couldn't build meta (${e.message})` }); }
};
