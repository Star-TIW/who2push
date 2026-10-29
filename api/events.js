const { getJSON } = require('./_util');
// Live event rotation + per-map brawler stats from Brawlify's public API.
module.exports = async (req, res) => {
  try {
    const ev = await getJSON('https://api.brawlify.com/v1/events');
    const active = (ev.active || []).filter(e => e && e.map);
    const upcoming = (ev.upcoming || []).filter(e => e && e.map).slice(0, 8);
    const needStats = [...active, ...upcoming].filter(e => !(e.map.stats && e.map.stats.length));
    await Promise.all(needStats.slice(0, 14).map(async e => {
      try { const m = await getJSON(`https://api.brawlify.com/v1/maps/${e.map.id}`); e.map.stats = m.stats || []; if (!e.map.imageUrl) e.map.imageUrl = m.imageUrl; } catch { e.map.stats = e.map.stats || []; }
    }));
    const slim = e => ({
      slot: e.slot && (e.slot.name || e.slot), startTime: e.startTime, endTime: e.endTime,
      mode: { name: e.map.gameMode?.name, color: e.map.gameMode?.color || e.map.gameMode?.bgColor, icon: e.map.gameMode?.imageUrl },
      map: { id: e.map.id, name: e.map.name, image: e.map.imageUrl },
      stats: (e.map.stats || []).map(s => ({ brawler: s.brawler, winRate: s.winRate, useRate: s.useRate, starRate: s.starRate }))
    });
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
    res.json({ active: active.map(slim), upcoming: upcoming.map(slim), fetchedAt: new Date().toISOString() });
  } catch (e) { res.status(502).json({ error: `Couldn't load events (${e.message})`, detail: e.body }); }
};
