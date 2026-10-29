const UA = { 'User-Agent': 'who2push/1.0', Accept: 'application/json' };
async function getJSON(url, headers = {}) {
  const r = await fetch(url, { headers: { ...UA, ...headers } });
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = null; }
  if (!r.ok || data === null) { const e = new Error(`HTTP ${r.status} from ${new URL(url).host}`); e.status = r.status; e.body = text.slice(0, 300); throw e; }
  return data;
}
function cleanTag(t) { return String(t || '').toUpperCase().replace(/^#/, '').replace(/O/g, '0').replace(/[^0289PYLQGRJCUV]/g, ''); }
module.exports = { getJSON, cleanTag };
