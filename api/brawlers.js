const { getJSON } = require('./_util');
module.exports = async (req, res) => {
  try {
    const b = await getJSON('https://api.brawlify.com/v1/brawlers');
    const list = (b.list || b.items || []).map(x => ({ id: x.id, name: x.name, image: x.imageUrl2 || x.imageUrl, class: x.class?.name, rarity: x.rarity?.name, color: x.rarity?.color }));
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.json({ list });
  } catch (e) { res.status(502).json({ error: e.message }); }
};
