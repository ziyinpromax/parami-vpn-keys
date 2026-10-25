#!/bin/bash
# Parami VPN Keys - Railway sing-box server (SS first, other protocols opt-in)
# MODE (Railway Variables, optional, default "ss"):
#   ss     = Shadowsocks only (existing behaviour, unchanged)
#   vless  = VLESS over WebSocket only (for Railway HTTP domain: 443/TLS at
#            the Railway edge, plain WS inside to sing-box)
#   vmess  = VMess over WebSocket only
#   trojan = Trojan over WebSocket only
#   all    = SS + VLESS-WS + VMess-WS + Trojan-WS together (different ports;
#            on Railway, HTTP domain can only point at ONE of them, so "all"
#            is mainly for local / non-Railway use - for Railway, use one
#            MODE per service instead, each service gets its own domain)
#
# Secrets come ONLY from Railway Variables, never from the repo:
#   SS_PASSWORD (required for ss/all), SS_METHOD (default aes-256-gcm),
#   SS_PORT (default 8388)
#   VLESS_UUID (required for vless/all), VLESS_PATH (default /vless),
#   VLESS_PORT (default 8390, used only in "all" mode; single-mode services
#               always listen on 8388 so the HTTP domain port stays 8388)
#   VMESS_UUID (required for vmess/all), VMESS_PATH (default /vmess),
#   VMESS_PORT (default 8391, "all" mode only)
#   TROJAN_PASSWORD (required for trojan/all), TROJAN_PATH (default /trojan),
#   TROJAN_PORT (default 8392, "all" mode only)
# Honest limits (see README): Railway TCP Proxy is TCP-only and there is
# only ONE TCP proxy per service; Railway HTTP domain is TLS/WS only.
# WireGuard / Hysteria need UDP, so they CANNOT work through Railway's
# TCP/HTTP proxies - they need a UDP-capable host (VPS, Termux, etc.).
# SSH needs an OpenSSH server, not sing-box - it is a separate service,
# not a MODE here. Outline is just SS with ?outline=1, so SS mode covers it.
set -e
MODE="${MODE:-ss}"
case "$MODE" in
  ss|vless|vmess|trojan|all) ;;
  *) echo "ERROR: unknown MODE '$MODE' (use ss, vless, vmess, trojan or all)" >&2; exit 1;;
esac
if { [ "$MODE" = "ss" ] || [ "$MODE" = "all" ]; } && [ -z "$SS_PASSWORD" ]; then
  echo "ERROR: SS_PASSWORD is not set in Railway Variables" >&2; exit 1
fi
if { [ "$MODE" = "vless" ] || [ "$MODE" = "all" ]; } && [ -z "$VLESS_UUID" ]; then
  echo "ERROR: VLESS_UUID is not set in Railway Variables" >&2; exit 1
fi
if { [ "$MODE" = "vmess" ] || [ "$MODE" = "all" ]; } && [ -z "$VMESS_UUID" ]; then
  echo "ERROR: VMESS_UUID is not set in Railway Variables" >&2; exit 1
fi
if { [ "$MODE" = "trojan" ] || [ "$MODE" = "all" ]; } && [ -z "$TROJAN_PASSWORD" ]; then
  echo "ERROR: TROJAN_PASSWORD is not set in Railway Variables" >&2; exit 1
fi
python3 - <<'PY'
import os, json
mode = os.environ.get("MODE", "ss")
inbounds = []
def ws(path):
    return {"type": "ws", "path": path}
if mode in ("ss", "all"):
    inbounds.append({
        "type": "shadowsocks", "tag": "ss-in",
        "listen": "0.0.0.0",
        "listen_port": int(os.environ.get("SS_PORT", "8388")),
        "method": os.environ.get("SS_METHOD", "aes-256-gcm"),
        "password": os.environ["SS_PASSWORD"],
    })
if mode == "vless":
    inbounds.append({
        "type": "vless", "tag": "vless-in",
        "listen": "0.0.0.0", "listen_port": 8388,
        "users": [{"uuid": os.environ["VLESS_UUID"], "flow": ""}],
        "transport": ws(os.environ.get("VLESS_PATH", "/vless")),
    })
if mode == "vmess":
    inbounds.append({
        "type": "vmess", "tag": "vmess-in",
        "listen": "0.0.0.0", "listen_port": 8388,
        "users": [{"uuid": os.environ["VMESS_UUID"], "alterId": 0}],
        "transport": ws(os.environ.get("VMESS_PATH", "/vmess")),
    })
if mode == "trojan":
    inbounds.append({
        "type": "trojan", "tag": "trojan-in",
        "listen": "0.0.0.0", "listen_port": 8388,
        "users": [{"password": os.environ["TROJAN_PASSWORD"]}],
        "transport": ws(os.environ.get("TROJAN_PATH", "/trojan")),
    })
if mode == "all":
    inbounds.append({
        "type": "vless", "tag": "vless-in",
        "listen": "0.0.0.0", "listen_port": int(os.environ.get("VLESS_PORT", "8390")),
        "users": [{"uuid": os.environ["VLESS_UUID"], "flow": ""}],
        "transport": ws(os.environ.get("VLESS_PATH", "/vless")),
    })
    inbounds.append({
        "type": "vmess", "tag": "vmess-in",
        "listen": "0.0.0.0", "listen_port": int(os.environ.get("VMESS_PORT", "8391")),
        "users": [{"uuid": os.environ["VMESS_UUID"], "alterId": 0}],
        "transport": ws(os.environ.get("VMESS_PATH", "/vmess")),
    })
    inbounds.append({
        "type": "trojan", "tag": "trojan-in",
        "listen": "0.0.0.0", "listen_port": int(os.environ.get("TROJAN_PORT", "8392")),
        "users": [{"password": os.environ["TROJAN_PASSWORD"]}],
        "transport": ws(os.environ.get("TROJAN_PATH", "/trojan")),
    })
config = {
    "log": {"level": "info"},
    "inbounds": inbounds,
    "outbounds": [{"type": "direct", "tag": "direct"}],
}
with open("/tmp/config.json", "w") as f:
    json.dump(config, f, indent=2)
print("Config written: MODE", mode, "inbounds",
      [(i["type"], i["listen_port"]) for i in inbounds])
PY
sing-box check -c /tmp/config.json
exec sing-box run -c /tmp/config.json
