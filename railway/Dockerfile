FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates python3 \
    && curl -L -o /tmp/sb.tar.gz https://github.com/SagerNet/sing-box/releases/download/v1.13.13/sing-box-1.13.13-linux-amd64.tar.gz \
    && tar -xzf /tmp/sb.tar.gz -C /usr/local/bin --strip-components=1 sing-box-1.13.13-linux-amd64/sing-box \
    && chmod +x /usr/local/bin/sing-box \
    && rm /tmp/sb.tar.gz \
    && apt-get purge -y curl && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
# Railway sets variables in its dashboard, never in this repo.
# Required: SS_PASSWORD. Optional: SS_METHOD (default aes-256-gcm), SS_PORT (default 8388).
CMD ["bash", "/entrypoint.sh"]
