# Who2Push ⭐

**Who should you push next in Brawl Stars?** Enter any player tag and Who2Push ranks every brawler you own for the maps that are live right now.

## What it does
- Loads your profile: total and highest trophies, brawler count, how many are at power 11
- Loads the live event rotation (mode, map, time left) with each brawler's win rate on that map
- Scores every brawler on three things, and you can change the weights with sliders:
  - **Meta**: its win-rate percentile on its best live map
  - **Power**: power level plus star powers, gadgets, gears and hypercharge
  - **Easy trophies**: lower trophies mean easier gains, plus a bonus if it's below its own best
- Shows your top 9 picks with the map to push them on and why
- Tap a map to see the best brawlers for that map only
- A sortable table of your whole roster

Anyone can use it. Just type in your `#TAG` (the letter O is changed to a zero for you, since tags only use 0).

## Data
- Player data: the official [Brawl Stars API](https://developer.brawlstars.com), called through the [RoyaleAPI proxy](https://docs.royaleapi.com/proxy.html) so you don't need a fixed IP
- Events, maps and win rates: the public [Brawlify API](https://brawlify.com)

## Deploy (Cloudflare Pages)
1. Make a free key at https://developer.brawlstars.com. Under **Allowed IP addresses**, put `45.79.218.79` (the RoyaleAPI proxy).
2. In Cloudflare, go to **Workers & Pages → Create → Pages → Connect to Git** and pick this repo.
   - Framework preset: **None**. Build command: *(leave it empty)*. Output directory: `/`
3. Under **Settings → Variables and Secrets**, add `BS_API_KEY` (type: Secret) and paste your key in.
4. Deploy. The `functions/api/*` files run as Pages Functions, so your key stays on the server and is never sent to the browser.

Optional: set `BS_API_BASE` to call a different API base URL (it defaults to `https://bsproxy.royaleapi.dev/v1`).

## Files
```
index.html            the whole front end (no build step)
functions/api/player.js    GET /api/player?tag=XXXX
functions/api/events.js    GET /api/events
functions/api/brawlers.js  GET /api/brawlers
```

Not affiliated with, endorsed, sponsored, or specifically approved by Supercell. See Supercell's Fan Content Policy: https://supercell.com/en/fan-content-policy/
