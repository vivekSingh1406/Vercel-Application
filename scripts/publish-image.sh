#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' 'ECR is no longer used. Run: ./scripts/deploy-ec2.sh IMAGE_TAG SSH_PRIVATE_KEY [DOMAIN]' >&2
exit 1
