# April Johnson Real Estate

Responsive static website with 13 main pages, a privacy page, custom 404 page, supplied photography, page metadata, structured data, and XML sitemap.

## Build and preview
Run `python3 build.py` from this directory, then serve `dist` (for example `python3 -m http.server 4173 --directory dist`).

## Deploy on Vercel
Import the folder (or run `vercel` / `vercel --prod`). `vercel.json` serves the prebuilt `dist` folder as a static site with no build step, so no Python is needed on Vercel. Rebuild locally with `python3 build.py` after editing content, then redeploy. Clean URLs, trailing slashes, the custom 404 page and asset caching are configured. Typography uses Google Sans from Google Fonts.

Copy is in `content.json`; templates are in `build.py`; styles and interactions are in `dist/assets`. Configuration is in `site-config.json`.

## Contact behavior
Published contact details: (301) 787-9265 and aprilj@1stclassre.com. Inquiry forms prepare a reviewable email draft and offer copy/download. They do not send or store submissions. The visitor must send the draft in their email application. The property planner prepares search preferences; it is not a live listing feed.

## Future launch work
Lofty integration is deferred at the owner's request. Connect an approved Lofty form or CRM endpoint and listing search before enabling automated lead delivery or live listings. The leadEndpoint and propertySearchUrl configuration values are reserved for that later implementation; setting them alone does not create an integration.

The current Site is private and intentionally noindex. Before public launch, configure the final domain, update siteUrl and publicIndexing, rebuild, and publish with the intended access settings. Confirm the brokerage's advertising requirements before the public launch. No search ranking is guaranteed.

All photos are from supplied assets. No testimonials, performance statistics, listing availability, or prices were invented.
