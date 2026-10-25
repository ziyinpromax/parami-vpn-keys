#!/bin/bash
# Parami VPN Keys - Railway SSH service entrypoint.
# Secrets ONLY from Railway Variables: SSH_USER, SSH_PASSWORD.
# Never put real credentials in the repo.
set -e
if [ -z "$SSH_USER" ]; then echo "ERROR: SSH_USER is not set in Railway Variables" >&2; exit 1; fi
if [ -z "$SSH_PASSWORD" ]; then echo "ERROR: SSH_PASSWORD is not set in Railway Variables" >&2; exit 1; fi
mkdir -p /run/sshd
ssh-keygen -A
if ! id "$SSH_USER" >/dev/null 2>&1; then
  useradd -m -s /bin/bash "$SSH_USER"
fi
echo "$SSH_USER:$SSH_PASSWORD" | chpasswd
# Plain SSH on 2222 inside the container. Railway's TCP Proxy maps
# this to a public high port - that public port is what clients use.
echo "SSH ready: user $SSH_USER on internal port 2222 (use Railway TCP Proxy host/port in Flâsh SSH form)"
exec /usr/sbin/sshd -D -p 2222 -e
