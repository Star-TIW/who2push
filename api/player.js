const { getJSON, cleanTag } = require('./_util');
// Official Brawl Stars API via the RoyaleAPI proxy (key must whitelist 45.79.218.79), or direct if BS_API_BASE set.
module.exports = async (req, res) => {
  const tag = cleanTag(req.query.tag);
  if (!tag) return res.status(400).json({ error: 'Enter a player tag' });
  const key = process.env.BS_API_KEY;
  if (!key) return res.status(503).json({ error: 'This site is missing its Brawl Stars API key (BS_API_KEY). See the README.' });
  const base = process.env.BS_API_BASE || 'https://bsproxy.royaleapi.dev/v1';
  try {
    const p = await getJSON(`${base}/players/%23${tag}`, { Authorization: `Bearer ${key}` });
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600');
    res.json(p);
  } catch (e) {
    const msg = e.status === 404 ? `No player found for #${tag}` : e.status === 403 ? 'API key rejected (check the IP allowlist: 45.79.218.79)' : `Brawl Stars API error (${e.message})`;
    res.status(e.status === 404 ? 404 : 502).json({ error: msg, detail: e.body });
  }
};
