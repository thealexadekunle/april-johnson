# April Johnson Real Estate

Responsive static website with 13 main pages, a privacy page, custom 404 page, supplied photography, page metadata, structured data, and XML sitemap.

## Build and preview
Run `python3 build.py` from this directory, then serve `dist` (for example `python3 -m http.server 4173 --directory dist`).

## Deploy on Vercel
Import the folder (or run `vercel` / `vercel --prod`). `vercel.json` serves the prebuilt `dist` folder as a static site with no build step, so no Python is needed on Vercel. Rebuild locally with `python3 build.py` after editing content, then redeploy. Clean URLs, trailing slashes, the custom 404 page and asset caching are configured. Typography uses Google Sans from Google Fonts.

Copy is in `content.json`; templates are in `build.py`; styles and interactions are in `dist/assets`. Configuration is in `site-config.json`.

## Lofty lead delivery
Every inquiry form posts to `api/lead.js`, a Vercel serverless function, at `/api/lead/`. The function creates a lead in April's Lofty CRM (`POST https://api.lofty.com/v1.0/leads`) with name, email or phone, lead type, timeframe, area or property address, a note containing the message, the tags `Website` and the inquiry type, and a new-lead alert to April.

The Lofty key is stored only as the encrypted Vercel environment variable `LOFTY_API_KEY` (Production). Never put it in code. To rotate it, create a new key in Lofty, then run `vercel env rm LOFTY_API_KEY production` and `vercel env add LOFTY_API_KEY production --sensitive`, and redeploy.

If Lofty cannot be reached, the form shows the visitor an email draft to April instead. A hidden honeypot field quietly discards simple spam bots.

Live property search (Lofty IDX) is not connected yet. Put April's Lofty IDX search link in `propertySearchUrl` when available.

## Future launch work
The current Site is private and intentionally noindex. Before public launch, configure the final domain, update siteUrl and publicIndexing, rebuild, and publish with the intended access settings. Confirm the brokerage's advertising requirements before the public launch. No search ranking is guaranteed.

All photos are from supplied assets. No testimonials, performance statistics, listing availability, or prices were invented.
