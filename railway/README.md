# Parami VPN Keys - Railway servers (like the Termux sing-box server)

This runs sing-box in a Railway container instead of on the phone. Railway
gives it a public address, so internet users can connect even when the
phone is off. One service = one protocol. To offer several protocols,
create one Railway service per protocol from the SAME repo (see below) -
do NOT try to squeeze them all into the existing SS service, or you will
break the working SS key.

## SS service (already working - do not change it)

1. New Project -> Deploy from GitHub -> repo `parami-vpn-keys`,
   Builder = Dockerfile, Root Directory = repo root (or `railway`).
2. Variables (Railway dashboard, NOT in the repo):
   - `SS_PASSWORD` = strong password, no spaces (required)
   - `SS_METHOD` = `aes-256-gcm` (optional, default)
   - `SS_PORT` = `8388` (optional, default)
   - `MODE` = leave unset (= `ss`)
3. Settings -> Networking -> TCP Proxy -> add port `8388`.
   Railway gives a public host + high port, e.g.
   `iriguchi.proxy.rlwy.net:21212`. That high port is NOT 8388.
4. Settings -> Serverless: OFF if you want it always on. Note: always-on
   bills usage. If Serverless is ON, it sleeps on outbound inactivity and
   an external ping does not keep it awake.
5. On the site, generate Shadowsocks with server = TCP Proxy host,
   port = TCP Proxy high port, method = `aes-256-gcm`,
   password = the same `SS_PASSWORD`. Outline = same SS link + `?outline=1`.

## VLESS / VMess / Trojan services (one service per protocol)

These use WebSocket through Railway's HTTP domain, NOT the TCP proxy:
Railway terminates TLS at the edge (443), sing-box inside sees plain WS.
That is why the link must be `security=tls, type=ws, port 443` - and why
a VLESS link to the TCP proxy host on port 443 with `type=tcp` can never
work (that host/port is not a VLESS server, and there is no TLS cert there).

For each new protocol, create a NEW Railway service from the same repo
(Builder = Dockerfile, same region as the SS service for low ping):

| Service | Variables (in addition to the repo) | HTTP domain port |
|---|---|---|
| VLESS | `MODE=vless`, `VLESS_UUID` = a UUID you generate on the site (do NOT send it in chat) | 8388 (default - the service listens on 8388) |
| VMess | `MODE=vmess`, `VMESS_UUID` = a UUID | 8388 |
| Trojan | `MODE=trojan`, `TROJAN_PASSWORD` = a strong password | 8388 |

Then generate the link on the site with that NEW service's HTTP domain
(not the SS TCP proxy host, not the SS service's domain):

- **VLESS:** server = new HTTP domain, port `443`, security `tls`,
  type `ws`, host = same domain, path `/vless`, sni = same domain,
  uuid = the same `VLESS_UUID`.
  Example shape (domain/uuid are placeholders, use your own):
  `vless://UUID@new-service.up.railway.app:443?security=tls&type=ws&host=new-service.up.railway.app&path=%2Fvless&sni=new-service.up.railway.app#Parami`
- **VMess:** same, but protocol VMess, path `/vmess`, uuid = `VMESS_UUID`.
- **Trojan:** same, but protocol Trojan, path `/trojan`,
  password = `TROJAN_PASSWORD`.

Check the new service's Deploy logs for `Config written: MODE vless`
(etc.) + `sing-box started` before testing in Flâsh VPN.

`MODE=all` (SS 8388 + VLESS 8390 + VMess 8391 + Trojan 8392) is for
local / non-Railway use only: on Railway, an HTTP domain can only point
at ONE port, so use one MODE per service instead.

## What Railway CANNOT do (honest limits)

- **WireGuard / Hysteria:** need UDP. Railway TCP Proxy is TCP-only and
  its HTTP domain is TCP/TLS/WS only, so UDP protocols cannot work
  through Railway. They need a UDP-capable host (a VPS, Termux on a
  reachable network, etc.) - the site can generate their configs, but
  Railway cannot serve them.
- **SSH:** needs an OpenSSH server, not sing-box. That is a separate
  service/Dockerfile, not a `MODE` here. The site's SSH block is for
  Flâsh VPN's SSH form, not for this sing-box container.
- **VLESS/VMess/Trojan over raw TCP with TLS:** needs a real TLS cert
  for the proxy domain. Railway's TCP proxy gives no cert, so use the
  WS-through-HTTP-domain route above instead.
- Railway is not free forever: trial credit, then usage billing. Each
  extra service bills separately - watch the usage dashboard.
- Railway is someone else's cloud, not your own hardware.
- Check Railway's terms for public proxy/VPN use before sharing keys
  widely. This deployment is a personal test setup, not a guarantee
  Railway will allow it at scale.
- Never put real passwords/UUIDs in GitHub. Change them in Railway
  Variables and redeploy; then regenerate the site key with the new values.
