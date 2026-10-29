// One-time setup helper: signs in to developer.brawlstars.com with BS_DEV_EMAIL / BS_DEV_PASSWORD,
// reads the "who2push" key, checks it works, and stores it as BS_API_KEY through the Vercel API (VERCEL_TOKEN).
// Never returns the key. Delete this file and those env vars after setup.
module.exports = async (req, res) => {
  const email = process.env.BS_DEV_EMAIL, pw = process.env.BS_DEV_PASSWORD, vt = String(process.env.VERCEL_TOKEN || '').trim();
  if (!email || !pw || !vt) return res.status(400).json({ error: 'missing env', email: !!email, pw: !!pw, vt: !!vt });
  const D = 'https://developer.brawlstars.com/api';
  const lr = await fetch(`${D}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pw }) });
  if (!lr.ok) return res.status(400).json({ error: 'dev login failed', status: lr.status, body: (await lr.text()).slice(0, 200) });
  const cookie = (lr.headers.getSetCookie ? lr.headers.getSetCookie() : [lr.headers.get('set-cookie')]).filter(Boolean).map(c => c.split(';')[0]).join('; ');
  const kl = await (await fetch(`${D}/apikey/list`, { method: 'POST', headers: { 'Content-Type': 'application/json', cookie }, body: '{}' })).json();
  const key = ((kl.keys || []).find(k => k.name === 'who2push') || {}).key;
  if (!key) return res.status(400).json({ error: 'key not found', names: (kl.keys || []).map(k => k.name), status: kl.status });
  const t = await fetch('https://bsproxy.royaleapi.dev/v1/brawlers?limit=1', { headers: { Authorization: 'Bearer ' + key } });
  if (!t.ok) return res.status(400).json({ error: 'key failed probe', status: t.status });
  const P = 'https://api.vercel.com', pid = 'prj_y5LXiBphvNFcURMszEa9VHsw6k19', H = { Authorization: 'Bearer ' + vt, 'Content-Type': 'application/json' };
  const list = await (await fetch(`${P}/v9/projects/${pid}/env`, { headers: H })).json();
  if (!list.envs) return res.status(502).json({ error: 'vercel list failed', detail: list.error });
  for (const e of list.envs.filter(e => e.key === 'BS_API_KEY')) await fetch(`${P}/v9/projects/${pid}/env/${e.id}`, { method: 'DELETE', headers: H });
  const r = await fetch(`${P}/v10/projects/${pid}/env`, { method: 'POST', headers: H, body: JSON.stringify({ key: 'BS_API_KEY', value: key, type: 'encrypted', target: ['production', 'preview', 'development'] }) });
  const j = await r.json();
  res.status(r.ok ? 200 : 502).json({ ok: r.ok, length: key.length, error: j.error });
};
