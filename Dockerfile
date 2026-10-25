FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates python3 \
    && curl -L -o /tmp/sb.tar.gz https://github.com/SagerNet/sing-box/releases/download/v1.13.13/sing-box-1.13.13-linux-amd64.tar.gz \
    && tar -xzf /tmp/sb.tar.gz -C /usr/local/bin --strip-components=1 sing-box-1.13.13-linux-amd64/sing-box \
    && chmod +x /usr/local/bin/sing-box \
    && rm /tmp/sb.tar.gz \
    && apt-get purge -y curl && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*
COPY railway/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
# Same as railway/Dockerfile, but at the repo root so Railway builds the
# sing-box server even if Root Directory is left as the repo root.
# Required: SS_PASSWORD in Railway Variables. Optional: SS_METHOD, SS_PORT.
CMD ["bash", "/entrypoint.sh"]
