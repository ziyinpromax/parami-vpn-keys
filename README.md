# Parami VPN Keys

Own VPN key generator site (Burmese) + server setups. Static site, no backend.

## Site

Open `index.html` with `app.js` in the same folder, or host them on
GitHub Pages / Cloudflare Pages (see `DEPLOY.md`).
Generates VLESS / VMess / Trojan / Shadowsocks / Outline / SSH configs,
saves keys in the browser only (localStorage), and exports a base64
subscription. A generated key only connects when a server runs the matching
config (same server, port, method, UUID/password).

## Servers

- Termux on a phone: `scripts/termux-quick.sh` + `configs/termux-singbox.json`
  (same-WiFi / hotspot only, phone must stay on).
- Railway: `railway/` (Dockerfile + entrypoint + README) — sing-box
  Shadowsocks in a container, exposed via Railway TCP Proxy.
- Linux VPS: `scripts/setup-xray.sh`, `scripts/setup-shadowsocks.sh`,
  `scripts/add-ssh-user.sh`, `configs/xray-example.json`.

No real passwords or UUIDs are stored in this repo — only placeholders.
Set real credentials in the server (Termux file, Railway Variables, etc.)
and generate the matching key on the site.
