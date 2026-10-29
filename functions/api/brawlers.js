import { getJSON, json } from './_util.js';
export async function onRequestGet() {
  try {
    const b = await getJSON('https://api.brawlify.com/v1/brawlers');
    const list = (b.list || []).map(x => ({ id: x.id, name: x.name, image: x.imageUrl2 || x.imageUrl, class: x.class?.name, rarity: x.rarity?.name }));
    return json({ list }, 200, 86400);
  } catch (e) { return json({ error: e.message }, 502); }
}
