# Use official Traefik image as base
FROM traefik:v3.4

# Create non-root user for security
RUN addgroup -g 1001 -S traefik && \
    adduser -u 1001 -D -S -G traefik traefik

# Create necessary directories with proper permissions
RUN mkdir -p /etc/traefik/dynamic \
             /var/log/traefik \
             /data/traefik && \
    chown -R traefik:traefik /etc/traefik /var/log/traefik /data/traefik

# Copy static configuration 
COPY --chown=traefik:traefik traefik.yml /etc/traefik/traefik.yml

# Copy dynamic configuration (optional)
COPY --chown=traefik:traefik dynamic.yml/ /etc/traefik/dynamic/

# Copy certificates if using custom SSL (optional)
# COPY --chown=traefik:traefik certs/ /etc/traefik/certs/

# Install curl for health checks
RUN apk add --no-cache curl

# Health check
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ping || exit 1

# Switch to non-root user
USER traefik

# Expose ports
EXPOSE 80 443 8080

# Use the configuration file
ENTRYPOINT ["traefik"]
CMD ["--configfile=/etc/traefik/traefik.yml"]