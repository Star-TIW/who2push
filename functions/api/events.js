import { getJSON, json } from './_util.js';
// GET /api/events -> live + upcoming rotation with per-map brawler win rates (Brawlify public API).
export async function onRequestGet() {
  try {
    const ev = await getJSON('https://api.brawlify.com/v1/events');
    const active = (ev.active || []).filter(e => e && e.map);
    const upcoming = (ev.upcoming || []).filter(e => e && e.map).slice(0, 8);
    const need = [...active, ...upcoming].filter(e => !(e.map.stats && e.map.stats.length)).slice(0, 14);
    await Promise.all(need.map(async e => {
      try { const m = await getJSON(`https://api.brawlify.com/v1/maps/${e.map.id}`); e.map.stats = m.stats || []; e.map.imageUrl ||= m.imageUrl; } catch { e.map.stats ||= []; }
    }));
    const slim = e => ({
      startTime: e.startTime, endTime: e.endTime,
      mode: { name: e.map.gameMode?.name, color: e.map.gameMode?.color || e.map.gameMode?.bgColor, icon: e.map.gameMode?.imageUrl },
      map: { id: e.map.id, name: e.map.name, image: e.map.imageUrl },
      stats: (e.map.stats || []).map(s => ({ brawler: s.brawler, winRate: s.winRate, useRate: s.useRate }))
    });
    return json({ active: active.map(slim), upcoming: upcoming.map(slim), fetchedAt: new Date().toISOString() }, 200, 900);
  } catch (e) { return json({ error: `Couldn't load events (${e.message})` }, 502); }
}
