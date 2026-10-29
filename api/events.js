const { getJSON } = require('./_util');
// Live event rotation. Tries Brawlify (has win rates), falls back to the official API rotation.
const slimBrawlify = e => ({
  startTime: e.startTime, endTime: e.endTime,
  mode: { name: e.map.gameMode?.name, color: e.map.gameMode?.color || e.map.gameMode?.bgColor, icon: e.map.gameMode?.imageUrl },
  map: { id: e.map.id, name: e.map.name, image: e.map.imageUrl },
  stats: (e.map.stats || []).map(s => ({ brawler: s.brawler, winRate: s.winRate, useRate: s.useRate }))
});
const offTime = s => s && s.length >= 15 ? `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}T${s.slice(9,11)}:${s.slice(11,13)}:${s.slice(13,15)}Z` : s;
const prettyMode = m => String(m || '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase());
module.exports = async (req, res) => {
  try {
    const ev = await getJSON('https://api.brawlify.com/v1/events');
    const active = (ev.active || []).filter(e => e && e.map);
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
    return res.json({ source: 'brawlify', active: active.map(slimBrawlify), fetchedAt: new Date().toISOString() });
  } catch (e) { /* fall through */ }
  const key = process.env.BS_API_KEY;
  if (!key) return res.status(502).json({ error: "Couldn't load the event rotation" });
  try {
    const base = process.env.BS_API_BASE || 'https://bsproxy.royaleapi.dev/v1';
    const rot = await getJSON(`${base}/events/rotation`, { Authorization: `Bearer ${key}` });
    const active = (Array.isArray(rot) ? rot : []).filter(r => r.event && r.event.map).map(r => ({
      startTime: offTime(r.startTime), endTime: offTime(r.endTime),
      mode: { name: prettyMode(r.event.mode), raw: r.event.mode, color: null, icon: null },
      map: { id: r.event.id, name: r.event.map, image: `https://cdn.brawlify.com/maps/regular/${r.event.id}.png` },
      stats: []
    }));
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
    res.json({ source: 'official', active, fetchedAt: new Date().toISOString() });
  } catch (e) { res.status(502).json({ error: `Couldn't load events (${e.message})` }); }
};
