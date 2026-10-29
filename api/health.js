// Config check: never returns the key itself, only its shape and decoded (non-secret) claims.
module.exports = async (req, res) => {
  const raw = String(process.env.BS_API_KEY || '');
  const k = raw.replace(/^\s*(Bearer\s+)?/i, '').replace(/\s+/g, '');
  const p = k.split('.');
  let hdr = null, claims = null;
  try { hdr = JSON.parse(Buffer.from(p[0], 'base64url').toString()); } catch {}
  try { const c = JSON.parse(Buffer.from(p[1], 'base64url').toString()); claims = { jti: c.jti, limits: c.limits }; } catch {}
  const ws = [...raw].map((ch, i) => /\s/.test(ch) ? i : -1).filter(i => i >= 0);
  const bad = [...k].filter(ch => !/[A-Za-z0-9_\-.]/.test(ch)).length;
  let probe = null;
  if (req.query.probe) { const r = await fetch('https://bsproxy.royaleapi.dev/v1/brawlers?limit=1', { headers: { Authorization: 'Bearer ' + k } }); probe = { status: r.status, body: (await r.text()).slice(0, 200) }; }
  res.json({ rawLength: raw.length, length: k.length, whitespaceAt: ws.slice(0, 10), badChars: bad, partLens: p.map(x => x.length), hdr, claims, probe });
};
