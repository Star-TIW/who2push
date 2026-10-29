const UA = { 'User-Agent': 'who2push/1.0', Accept: 'application/json' };
export async function getJSON(url, headers = {}) {
  const r = await fetch(url, { headers: { ...UA, ...headers } });
  const text = await r.text();
  let data = null; try { data = JSON.parse(text); } catch {}
  if (!r.ok || data === null) { const e = new Error(`HTTP ${r.status} from ${new URL(url).host}`); e.status = r.status; e.body = text.slice(0, 300); throw e; }
  return data;
}
export const cleanTag = t => String(t || '').toUpperCase().replace(/^#/, '').replace(/O/g, '0').replace(/[^0289PYLQGRJCUV]/g, '');
export const json = (obj, status = 200, maxAge = 0) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*', ...(maxAge ? { 'cache-control': `public, max-age=${maxAge}` } : {}) } });
