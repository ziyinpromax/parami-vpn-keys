# Parami VPN Keys - Railway SSH service (separate from sing-box)
# sing-box cannot serve SSH, so SSH gets its own service + Dockerfile.
# Secrets come ONLY from Railway Variables, never from the repo:
#   SSH_USER (required), SSH_PASSWORD (required, no spaces)
# Railway Networking: add a TCP Proxy on port 2222. Railway gives a
# public host + high port. Flâsh VPN SSH form uses that host/port
# directly (Proxy/TLS/Payload empty first) - it is plain SSH, not WS.
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssh-server \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /run/sshd
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 2222
ENTRYPOINT ["/entrypoint.sh"]
