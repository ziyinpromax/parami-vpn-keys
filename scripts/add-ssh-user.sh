#!/bin/bash
# Parami VPN Keys - SSH user creator (Linux server / router with useradd)
# Usage: sudo bash add-ssh-user.sh <username> <days-valid>
# Password is read from stdin prompt, never put it on the command line.
# This does NOT create a Flâsh VPN link - SSH is filled in Flâsh's SSH form.
set -e
USER_NAME="${1:-}"
DAYS="${2:-30}"
if [ -z "$USER_NAME" ]; then echo "Usage: sudo bash add-ssh-user.sh <username> <days>"; exit 1; fi
if [ "$(id -u)" != "0" ]; then echo "Run as root / sudo"; exit 1; fi
id "$USER_NAME" >/dev/null 2>&1 || useradd -m -s /bin/bash "$USER_NAME"
passwd "$USER_NAME"
chage -M "$DAYS" -W 7 "$USER_NAME"
echo "OK: user=$USER_NAME valid ${DAYS} days. Fill Host/Port/User/Pass in Flâsh VPN SSH form."
