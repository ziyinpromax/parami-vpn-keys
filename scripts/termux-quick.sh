# Parami VPN Keys - Termux server (same-WiFi only, personal test)
# 1) Install Termux from F-Droid / official GitHub releases (NOT the old Play Store build).
# 2) In Termux, run:
#      pkg update -y
#      pkg install sing-box -y
#      termux-wake-lock
# 3) Create ~/sb.json with the Shadowsocks part only first (copy configs/termux-singbox.json
#    and replace YOUR-PASSWORD-HERE, or paste the JSON from the chat guide).
#    Delete the vless inbound block for the first test - SS alone is the simplest.
# 4) Check and run:
#      sing-box check -c ~/sb.json
#      sing-box run -c ~/sb.json
#    Keep Termux open. Android Settings > Apps > Termux > Battery > Unrestricted helps it stay alive.
# 5) Find the phone's WiFi IP:  ip addr show wlan0   (look for 192.168.x.x, NOT 100.104.x.x)
# 6) On the Parami VPN Keys site: Shadowsocks, server=<that 192.168 IP>, port 8388,
#    method aes-256-gcm, password = same password as in sb.json. Copy the link.
# 7) Test from a SECOND device on the same WiFi with Flâsh VPN paste-import.
#    Same-phone server + same-phone VPN client is a loopback test, not a real use case -
#    the server phone is meant to serve other devices on that WiFi.
# 8) Stop: Ctrl+C in Termux, then: termux-wake-unlock
# Limits: same WiFi only. Mobile-data CGNAT (100.104.x.x) is not reachable from the internet.
# Phone sleeps / Termux is swiped away / WiFi changes IP -> server stops or moves.
echo "This file is the guide. The runnable steps are the comments above."
