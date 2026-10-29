// One-time setup helper: takes a Brawl Stars key from the x-bs-key header, checks it works,
// and stores it as BS_API_KEY through the Vercel API. Needs VERCEL_TOKEN set; remove after setup.
module.exports = async (req, res) => {
  const k = String(req.headers['x-bs-key'] || '').trim();
  const vt = String(process.env.VERCEL_TOKEN || '').trim();
  if (!k || !vt) return res.status(400).json({ error: 'missing key or token' });
  const t = await fetch('https://bsproxy.royaleapi.dev/v1/brawlers?limit=1', { headers: { Authorization: 'Bearer ' + k } });
  if (!t.ok) return res.status(400).json({ error: 'key failed probe', status: t.status });
  const P = 'https://api.vercel.com', pid = process.env.VERCEL_PROJECT_ID || 'prj_y5LXiBphvNFcURMszEa9VHsw6k19', H = { Authorization: 'Bearer ' + vt, 'Content-Type': 'application/json' };
  const list = await (await fetch(`${P}/v9/projects/${pid}/env`, { headers: H })).json();
  if (!list.envs) return res.status(502).json({ error: 'vercel list failed', detail: list.error });
  for (const e of list.envs.filter(e => e.key === 'BS_API_KEY')) await fetch(`${P}/v9/projects/${pid}/env/${e.id}`, { method: 'DELETE', headers: H });
  const r = await fetch(`${P}/v10/projects/${pid}/env`, { method: 'POST', headers: H, body: JSON.stringify({ key: 'BS_API_KEY', value: k, type: 'encrypted', target: ['production', 'preview', 'development'] }) });
  const j = await r.json();
  res.status(r.ok ? 200 : 502).json({ ok: r.ok, length: k.length, error: j.error });
};
