#!/bin/bash
# Parami VPN Keys - Railway sing-box Shadowsocks server (same SS as Termux guide)
# Password comes from Railway Variables (SS_PASSWORD), never from the repo.
set -e
if [ -z "$SS_PASSWORD" ]; then
  echo "ERROR: SS_PASSWORD is not set in Railway Variables" >&2
  exit 1
fi
python3 - <<'PY'
import os, json
config = {
    "log": {"level": "info"},
    "inbounds": [{
        "type": "shadowsocks",
        "tag": "ss-in",
        "listen": "0.0.0.0",
        "listen_port": int(os.environ.get("SS_PORT", "8388")),
        "method": os.environ.get("SS_METHOD", "aes-256-gcm"),
        "password": os.environ["SS_PASSWORD"],
    }],
    "outbounds": [{"type": "direct", "tag": "direct"}],
}
with open("/tmp/config.json", "w") as f:
    json.dump(config, f, indent=2)
print("Config written: SS port", config["inbounds"][0]["listen_port"],
      "method", config["inbounds"][0]["method"])
PY
sing-box check -c /tmp/config.json
exec sing-box run -c /tmp/config.json
