// Config check: says whether the API key is set and working. Never returns the key.
module.exports = async (req, res) => {
  const k = String(process.env.BS_API_KEY || '').trim();
  let api = null;
  if (k) { const r = await fetch('https://bsproxy.royaleapi.dev/v1/brawlers?limit=1', { headers: { Authorization: 'Bearer ' + k } }); api = r.status; }
  res.json({ hasKey: !!k, apiStatus: api });
};
