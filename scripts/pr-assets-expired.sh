#!/usr/bin/env bash
# Usage: RETENTION_DAYS=14 scripts/pr-assets-expired.sh
# Run inside a `pr-assets` checkout: prints each pr-<N> folder whose PR closed over RETENTION_DAYS ago.
set -euo pipefail

cutoff=$(($(date +%s) - ${RETENTION_DAYS:?RETENTION_DAYS is required} * 86400))

for dir in pr-*/; do
  n=${dir#pr-}
  n=${n%/}
  [[ $n =~ ^[0-9]+$ ]] || continue
  if ! json=$(gh pr view "$n" --json state,closedAt); then
    echo "pr-assets: cannot read PR $n, keeping pr-$n" >&2
    continue
  fi
  closed=$(jq -r 'select(.state != "OPEN") | .closedAt // empty' <<<"$json")
  if [ -n "$closed" ] && [ "$(date -d "$closed" +%s)" -lt "$cutoff" ]; then
    echo "pr-$n"
  fi
done
