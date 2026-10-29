// Config check: never returns the key itself, only its decoded (non-secret) claims.
module.exports = (req, res) => {
  const k = String(process.env.BS_API_KEY || '').replace(/^\s*(Bearer\s+)?/i, '').replace(/\s+/g, '');
  let claims = null; try { const c = JSON.parse(Buffer.from(k.split('.')[1], 'base64url').toString()); claims = { jti: c.jti, iat: c.iat, limits: c.limits }; } catch {}
  res.json({ hasKey: !!k, length: k.length, parts: k ? k.split('.').length : 0, sigLen: k ? (k.split('.')[2] || '').length : 0, claims });
};
