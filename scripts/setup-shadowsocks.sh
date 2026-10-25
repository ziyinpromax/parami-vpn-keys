#!/bin/bash
# Parami VPN Keys - Shadowsocks server setup (Debian/Ubuntu, template - test before sharing)
# Usage: sudo SS_PASSWORD='your-password' SS_PORT=8388 SS_METHOD=aes-256-gcm bash setup-shadowsocks.sh
# The password here MUST match the password used on the site generator.
set -e
SS_PASSWORD="${SS_PASSWORD:-}"
SS_PORT="${SS_PORT:-8388}"
SS_METHOD="${SS_METHOD:-aes-256-gcm}"
if [ -z "$SS_PASSWORD" ]; then echo "Set SS_PASSWORD first"; exit 1; fi
apt-get update && apt-get install -y shadowsocks-libev
mkdir -p /etc/shadowsocks-libev
cat > /etc/shadowsocks-libev/config.json <<EOF
{
  "server": "0.0.0.0",
  "server_port": $SS_PORT,
  "password": "$SS_PASSWORD",
  "method": "$SS_METHOD",
  "mode": "tcp_and_udp",
  "timeout": 300
}
EOF
systemctl enable --now shadowsocks-libev
echo "OK: Shadowsocks on port $SS_PORT method $SS_METHOD. Open this port in firewall/router."
echo "Outline: Outline's own server uses Shadowsocks too - install it from its official script instead if you want Outline management API."
