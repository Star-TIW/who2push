import { getJSON, cleanTag, json } from './_util.js';
// GET /api/player?tag=XXXX  -> official Brawl Stars API player profile.
// Needs env BS_API_KEY. Default base is the RoyaleAPI proxy (whitelist IP 45.79.218.79 on your key).
export async function onRequestGet({ request, env }) {
  const tag = cleanTag(new URL(request.url).searchParams.get('tag'));
  if (!tag) return json({ error: 'Enter a player tag' }, 400);
  if (!env.BS_API_KEY) return json({ error: 'This site is missing its Brawl Stars API key (BS_API_KEY). See the README.' }, 503);
  const base = env.BS_API_BASE || 'https://bsproxy.royaleapi.dev/v1';
  try {
    const p = await getJSON(`${base}/players/%23${tag}`, { Authorization: `Bearer ${env.BS_API_KEY}` });
    return json(p, 200, 120);
  } catch (e) {
    if (e.status === 404) return json({ error: `No player found for #${tag}. Double-check your tag.` }, 404);
    if (e.status === 403) return json({ error: 'API key rejected. Make sure the key allows IP 45.79.218.79.' }, 502);
    return json({ error: `Brawl Stars API error (${e.message})` }, 502);
  }
}
