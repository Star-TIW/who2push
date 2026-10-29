// Quick config check: never returns the key, only whether it looks like a JWT.
module.exports = (req, res) => {
  const k = String(process.env.BS_API_KEY || '').replace(/^\s*(Bearer\s+)?/i, '').replace(/\s+/g, '');
  res.json({ hasKey: !!k, length: k.length, parts: k ? k.split('.').length : 0, end: k.slice(-4) });
};
