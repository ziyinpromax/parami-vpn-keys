# Parami VPN Keys - Deploy (static site, no backend)

Files: `index.html` + `app.js` only are needed to run the site.
`scripts/` and `configs/` are server-side templates, not part of the web page.

## Option A - GitHub Pages (free)
1. New repo, upload `index.html` + `app.js`.
2. Settings -> Pages -> Deploy from branch, root.
3. Site URL will be `https://<user>.github.io/<repo>/`.

## Option B - Cloudflare Pages (free, separate account per app rule)
1. New Pages project, upload the same two files (or connect the repo).
2. Do NOT use a Cloudflare Worker as a VPN endpoint - this site is only a key generator page.

## Option C - Home router / home device
Serve the two files with any static web server on the always-on device,
and expose only the page (not the VPN server) via Cloudflare Tunnel if needed.

## Security notes
- Never put real server passwords/UUIDs into the published site files.
- Keys generated on the page stay in that visitor's browser localStorage.
- A public generator page does NOT create server accounts by itself.
  Account creation happens only when the matching config is run on the server.
