#!/bin/bash
# Parami VPN Keys - Xray install + config template (Debian/Ubuntu, test before sharing)
# Usage: sudo UUID='your-uuid' bash setup-xray.sh
# Then edit /usr/local/etc/xray/config.json: replace YOUR-DOMAIN, certificate paths,
# and add a real TLS certificate (certbot) before using security=tls in public.
# VLESS security=none on a public IP is refused by Flâsh's Xray core - use TLS.
set -e
UUID="${UUID:-}"
if [ -z "$UUID" ]; then echo "Set UUID first (same UUID as on the site)"; exit 1; fi
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install
cp ~/workspace/parami-vpn-site/configs/xray-example.json /tmp/xray-example.json 2>/dev/null || cp configs/xray-example.json /tmp/xray-example.json 2>/dev/null || true
echo "Xray installed. Copy configs/xray-example.json to /usr/local/etc/xray/config.json"
echo "and replace YOUR-UUID with $UUID and YOUR-DOMAIN with your domain, then: systemctl restart xray"
