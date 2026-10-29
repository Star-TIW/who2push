const { getJSON } = require('./_util');
// Brawler names and portraits. Brawlify first, official API as a fallback.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
  try {
    const b = await getJSON('https://api.brawlify.com/v1/brawlers');
    return res.json({ list: (b.list || []).map(x => ({ id: x.id, name: x.name, image: x.imageUrl2 || x.imageUrl })) });
  } catch {}
  const key = process.env.BS_API_KEY;
  if (!key) return res.status(502).json({ error: "Couldn't load brawlers" });
  try {
    const b = await getJSON(`${process.env.BS_API_BASE || 'https://bsproxy.royaleapi.dev/v1'}/brawlers`, { Authorization: `Bearer ${key}` });
    res.json({ list: (b.items || []).map(x => ({ id: x.id, name: x.name, image: `https://cdn.brawlify.com/brawlers/borderless/${x.id}.png` })) });
  } catch (e) { res.status(502).json({ error: e.message }); }
};
