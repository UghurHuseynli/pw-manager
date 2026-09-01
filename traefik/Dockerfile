# Use official Traefik image as base
# NOTE: pin >= v3.6.1 — earlier releases hardcode Docker API v1.24 in the
# docker provider, which Docker Engine 29+ rejects outright (MinAPIVersion
# 1.44). v3.6+ auto-negotiates the API version instead.
# https://github.com/traefik/traefik/issues/12253
FROM traefik:v3.6

# Runs as root (the image default): Traefik needs read access to the
# host's /var/run/docker.sock to use the Docker provider, and that
# socket is not readable by an unprivileged container user without
# extra host-side group wrangling or a socket-proxy sidecar.

# Create necessary directories
RUN mkdir -p /etc/traefik/dynamic \
             /var/log/traefik \
             /data/traefik

# Copy static configuration
COPY traefik.yml /etc/traefik/traefik.yml

# Copy dynamic configuration (optional)
COPY dynamic.yml/ /etc/traefik/dynamic/

# Copy certificates if using custom SSL (optional)
# COPY certs/ /etc/traefik/certs/

# Install curl for health checks
RUN apk add --no-cache curl

# Health check
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ping || exit 1

# Expose ports
EXPOSE 80 443 8080

# Use the configuration file
ENTRYPOINT ["traefik"]
CMD ["--configfile=/etc/traefik/traefik.yml"]