#!/usr/bin/env bash
# Called by deploy-ec2.sh on EC2 as root.
set -euo pipefail
STAGING="${1:?Missing staging directory}"
TAG="${2:?Missing image tag}"
[[ "$TAG" =~ ^[a-zA-Z0-9_][a-zA-Z0-9_.-]{0,127}$ ]] || exit 1
# Load/pull before stopping the current application.
gzip -dc "$STAGING/image.tar.gz" | docker load
docker pull caddy:2-alpine
docker network inspect village >/dev/null 2>&1 || docker network create village
docker volume create village-caddy-data >/dev/null
docker volume create village-caddy-config >/dev/null
install -m 600 "$STAGING/app.env" /opt/village/app.env
install -m 644 "$STAGING/Caddyfile" /opt/village/Caddyfile
if docker container inspect village-app >/dev/null 2>&1; then
  docker stop --time 30 village-app
  docker rm village-app
fi
docker run -d --name village-app --restart unless-stopped --network village \
  --init --read-only --cap-drop=ALL --security-opt=no-new-privileges \
  --memory=1400m --tmpfs /tmp:rw,nosuid,size=512m \
  --env-file /opt/village/app.env \
  --mount type=bind,src=/opt/village/uploads,dst=/app/uploads \
  --log-opt max-size=10m --log-opt max-file=3 "gautiyan-tola:$TAG"
if docker container inspect village-proxy >/dev/null 2>&1; then
  docker stop village-proxy
  docker rm village-proxy
fi
docker run -d --name village-proxy --restart unless-stopped --network village \
  -p 80:80 -p 443:443 \
  -v /opt/village/Caddyfile:/etc/caddy/Caddyfile:ro \
  -v village-caddy-data:/data -v village-caddy-config:/config \
  --log-opt max-size=10m --log-opt max-file=3 caddy:2-alpine
# Check the JSP route over the private Docker network, including compilation.
for attempt in $(seq 1 60); do
  if docker exec village-proxy wget -q -O /dev/null http://village-app:8080/login; then
    echo 'Application login page is healthy.'
    exit 0
  fi
  sleep 5
done
echo 'Application did not become healthy. Inspect: sudo docker logs village-app' >&2
exit 1
