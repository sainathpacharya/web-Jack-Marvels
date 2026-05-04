#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/deploy-ec2.sh \
    --host <ec2-host> \
    --user <ssh-user> \
    --key <pem-path> \
    [--port <ssh-port>] \
    [--path <remote-deploy-path>] \
    [--skip-build]

Examples:
  scripts/deploy-ec2.sh \
    --host 54.198.71.21 \
    --user ec2-user \
    --key ~/Downloads/jackmarvels-key.pem \
    --path /var/www/alpha-frontend
EOF
}

HOST=""
USER_NAME=""
KEY_PATH=""
PORT="22"
REMOTE_PATH="/var/www/alpha-frontend"
SKIP_BUILD="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --host)
      HOST="${2:-}"
      shift 2
      ;;
    --user)
      USER_NAME="${2:-}"
      shift 2
      ;;
    --key)
      KEY_PATH="${2:-}"
      shift 2
      ;;
    --port)
      PORT="${2:-22}"
      shift 2
      ;;
    --path)
      REMOTE_PATH="${2:-/var/www/alpha-frontend}"
      shift 2
      ;;
    --skip-build)
      SKIP_BUILD="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$HOST" || -z "$USER_NAME" || -z "$KEY_PATH" ]]; then
  echo "Error: --host, --user and --key are required." >&2
  usage
  exit 1
fi

if [[ ! -f "$KEY_PATH" ]]; then
  echo "Error: SSH key not found at $KEY_PATH" >&2
  exit 1
fi

chmod 400 "$KEY_PATH"

if [[ "$SKIP_BUILD" != "true" ]]; then
  echo "Building frontend..."
  npm ci
  npm run build
fi

if [[ ! -d "dist" ]]; then
  echo "Error: dist directory not found. Run build first." >&2
  exit 1
fi

ARTIFACT="/tmp/alpha-frontend-dist.tgz"
tar --no-xattrs -czf "$ARTIFACT" -C dist .

echo "Uploading build artifact..."
scp -P "$PORT" -i "$KEY_PATH" "$ARTIFACT" "$USER_NAME@$HOST:/tmp/alpha-frontend-dist.tgz"

echo "Deploying on server..."
ssh -p "$PORT" -i "$KEY_PATH" "$USER_NAME@$HOST" "set -e; \
  TS=\$(date +%Y%m%d%H%M%S); \
  sudo mkdir -p \"$REMOTE_PATH\"; \
  if [ -d \"$REMOTE_PATH\" ] && [ \"\$(ls -A \"$REMOTE_PATH\" 2>/dev/null)\" ]; then \
    sudo cp -a \"$REMOTE_PATH\" \"${REMOTE_PATH}.bak_\$TS\"; \
  fi; \
  sudo rm -rf \"$REMOTE_PATH\"/*; \
  sudo tar -xzf /tmp/alpha-frontend-dist.tgz -C \"$REMOTE_PATH\"; \
  sudo find \"$REMOTE_PATH\" -name '._*' -delete; \
  sudo chown -R nginx:nginx \"$REMOTE_PATH\"; \
  sudo nginx -t; \
  sudo systemctl reload nginx; \
  echo \"Deploy complete: $REMOTE_PATH\""

echo "Deployment finished successfully."
