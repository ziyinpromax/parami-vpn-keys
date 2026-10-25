# Parami VPN Keys - Railway server (like the Termux sing-box server)

This runs the SAME Shadowsocks server as the Termux guide, but in a Railway
container instead of on the phone. That is the key difference: Railway gives it
a public address, so internet users can connect even when the phone is off.

## Deploy (Railway dashboard, no code change)

1. Push this `railway/` folder to a GitHub repo. In Railway, set the service
   Root Directory to `railway` (so it uses this Dockerfile).
2. New Project -> Deploy from GitHub -> pick the repo.
3. Variables (Railway dashboard, NOT in the repo):
   - `SS_PASSWORD` = strong password, no spaces (required)
   - `SS_METHOD` = `aes-256-gcm` (optional, this is the default)
   - `SS_PORT` = `8388` (optional, this is the default internal port)
4. Settings -> Networking -> TCP Proxy -> add port `8388`.
   Railway gives a public host + high port, for example
   `something.up.railway.app:31234`. That high port is NOT 8388.
5. Settings -> Serverless: OFF if you want it always on. Note: always-on
   bills usage. If Serverless is ON, it sleeps on outbound inactivity and an
   external ping does not keep it awake.
6. On the Parami VPN Keys site, generate Shadowsocks with:
   - server = the TCP Proxy host (the part before `:`)
   - port = the TCP Proxy high port (the part after `:`)
   - method = `aes-256-gcm`, password = the same `SS_PASSWORD`
7. Paste that link into Flâsh VPN and connect.

## Limits (read before sharing)

- TCP Proxy is TCP only. Shadowsocks over TCP works; UDP relay and
  WireGuard (UDP) do not work through it.
- Railway is not free forever: trial credit, then usage billing. A 24/7
  VPN server uses bandwidth, so watch the usage dashboard.
- Railway is someone else's cloud, not your own hardware.
- Check Railway's terms for public proxy/VPN use before sharing the key
  widely. This deployment is a personal test setup, not a guarantee
  Railway will allow it at scale.
- Never put the real password in GitHub. Change it in Railway Variables
  and redeploy; then regenerate the site key with the new password.
