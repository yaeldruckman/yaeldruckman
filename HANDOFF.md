# Handoff — 2026-09-06

## Done
- Cloudflare Turnstile on EN + HE contact forms (`action=contact`, sitekey `0x4AAAAAAEqThupzZW7KG05P`).
- `contact-form.js` (Apps Script): siteverify, fail-closed, hostname allowlist `yaeldruckman.com` / `www`.
- `.env` gitignored (`SITE_KEY`, `SECRET`). Dummy siteverify confirmed the secret is valid.
- DNS/registrar already Cloudflare. Widget already created — do not create another.

## Next
1. Apps Script → Script Properties: `TURNSTILE_SECRET` = `.env` `SECRET` (never commit it).
2. Deploy web app (Execute as Me, Anyone) → paste `/exec` URL into `scriptURL` in `script.js`.
3. Live submit + replay-reject test. Localhost hostname is not allowed in production.
4. Replace `you@gmail.com` in `contact-form.js`. `CNAME` is still `fulo.life`.

## Notes
- Client owns the Cloudflare account. Form POST is FormData; GAS reads `e.parameter`.
- Rebuild: `npm run build` (pages load `script.min.js` / `styles.min.css`).
