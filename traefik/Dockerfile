FROM traefik:v3.6

RUN mkdir -p /etc/traefik/dynamic \
             /var/log/traefik \
             /data/traefik

COPY traefik.yml /etc/traefik/traefik.yml

COPY dynamic.yml/ /etc/traefik/dynamic/

RUN apk add --no-cache curl

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ping || exit 1

EXPOSE 80 443 8080

ENTRYPOINT ["traefik"]
CMD ["--configfile=/etc/traefik/traefik.yml"]