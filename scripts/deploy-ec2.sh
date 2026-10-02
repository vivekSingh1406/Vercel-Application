#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TAG="${1:?Usage: scripts/deploy-ec2.sh IMAGE_TAG SSH_PRIVATE_KEY [DOMAIN]}"
KEY="${2:?Supply the SSH private key path}"
DOMAIN="${3:-}"
[[ "$TAG" =~ ^[a-zA-Z0-9_][a-zA-Z0-9_.-]{0,127}$ ]] || { echo 'Invalid tag' >&2; exit 1; }
[[ -z "$DOMAIN" || "$DOMAIN" =~ ^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$ ]] || { echo 'Supply a hostname without https:// or a path' >&2; exit 1; }
: "${TF_VAR_db_password:?Export the same TF_VAR_db_password used by Terraform}"
[[ "$TF_VAR_db_password" =~ ^[A-Za-z0-9_-]{20,64}$ ]] || { echo 'Invalid database password format' >&2; exit 1; }
read -r -s -p 'Admin password (20+ letters, digits, underscores or hyphens): ' ADMIN_PASSWORD
printf '\n'
[[ "$ADMIN_PASSWORD" =~ ^[A-Za-z0-9_-]{20,128}$ ]] || { echo 'Invalid admin password format' >&2; exit 1; }
IP="$(terraform -chdir="$ROOT/infra/terraform" output -raw public_ip)"
DB_HOST="$(terraform -chdir="$ROOT/infra/terraform" output -raw database_host)"
WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT
umask 077
cat > "$WORK_DIR/app.env" <<ENV
SPRING_PROFILES_ACTIVE=production
DB_URL=jdbc:mysql://$DB_HOST:3306/appdb?sslMode=REQUIRED
DB_USERNAME=appadmin
DB_PASSWORD=$TF_VAR_db_password
ADMIN_USERNAME=admin
ADMIN_PASSWORD=$ADMIN_PASSWORD
SERVER_FORWARD_HEADERS_STRATEGY=framework
SERVER_SERVLET_SESSION_COOKIE_SECURE=$([[ -n "$DOMAIN" ]] && echo true || echo false)
SPRING_JPA_SHOW_SQL=false
JAVA_TOOL_OPTIONS=-XX:MaxRAMPercentage=70.0
ENV
printf '%s {\n  reverse_proxy village-app:8080\n}\n' "${DOMAIN:-:80}" > "$WORK_DIR/Caddyfile"
docker buildx build --platform linux/amd64 --load --tag "gautiyan-tola:$TAG" "$ROOT"
docker save "gautiyan-tola:$TAG" | gzip > "$WORK_DIR/image.tar.gz"
SSH=(ssh -i "$KEY" -o IdentitiesOnly=yes "ec2-user@$IP")
# Keep normal host-key verification enabled. First connection asks you to trust the host.
"${SSH[@]}" 'sudo cloud-init status --wait && sudo test -f /opt/village/bootstrap-ready'
REMOTE_DIR="$("${SSH[@]}" 'umask 077; mktemp -d /home/ec2-user/village-deploy.XXXXXXXX')"
[[ "$REMOTE_DIR" =~ ^/home/ec2-user/village-deploy\.[A-Za-z0-9]+$ ]] || { echo 'Invalid remote staging path' >&2; exit 1; }
trap 'rm -rf "$WORK_DIR"; "${SSH[@]}" "rm -rf -- $REMOTE_DIR" || true' EXIT
scp -i "$KEY" -o IdentitiesOnly=yes "$WORK_DIR/image.tar.gz" "$WORK_DIR/app.env" "$WORK_DIR/Caddyfile" "$ROOT/scripts/start-ec2.sh" "ec2-user@$IP:$REMOTE_DIR/"
"${SSH[@]}" "sudo bash '$REMOTE_DIR/start-ec2.sh' '$REMOTE_DIR' '$TAG'"
printf 'Deployed. Open %s\n' "$([[ -n "$DOMAIN" ]] && printf 'https://%s' "$DOMAIN" || printf 'http://%s' "$IP")"
