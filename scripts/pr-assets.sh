#!/usr/bin/env bash
# Usage: scripts/pr-assets.sh <pr-number> <file>...
# Uploads files to pr-<N>/ on the orphan `pr-assets` branch and prints their raw URLs.
set -euo pipefail

remote=${PR_ASSETS_REMOTE:-https://github.com/cdfarkas/ds-omnia.git}
raw=https://raw.githubusercontent.com/cdfarkas/ds-omnia/pr-assets
branch=pr-assets
max_bytes=$((10 * 1024 * 1024))

die() { echo "pr-assets: $*" >&2; exit 1; }

[ $# -ge 2 ] || die "usage: $0 <pr-number> <file>..."
pr=$1
shift
[[ $pr =~ ^[0-9]+$ ]] || die "PR number must be numeric: $pr"
files=()
for f in "$@"; do
  [ -f "$f" ] || die "not a file: $f"
  [ "$(wc -c <"$f")" -le "$max_bytes" ] || die "larger than 10 MB: $f"
  files+=("$(cd "$(dirname "$f")" && pwd)/$(basename "$f")")
done

# Reuse the caller's identity so a global (possibly private) email never lands in the public history.
name=$(git config user.name) || die "git user.name is not set"
email=$(git config user.email) || die "git user.email is not set"

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
repo=$tmp/repo
git init --quiet "$repo"
cd "$repo"
git config user.name "$name"
git config user.email "$email"
git remote add origin "$remote"

if git ls-remote --exit-code --heads origin "$branch" >/dev/null; then
  git fetch --quiet origin "$branch"
  git checkout --quiet -b "$branch" FETCH_HEAD
else
  rc=$?
  [ "$rc" -eq 2 ] || exit "$rc"
  git checkout --quiet --orphan "$branch"
fi

mkdir -p "pr-$pr"
cp "${files[@]}" "pr-$pr/"
git add "pr-$pr"
git diff --cached --quiet || git commit --quiet -m "pr-$pr: add $# file(s)"

for attempt in 0 1 2 3; do
  git push --quiet origin "HEAD:refs/heads/$branch" && break
  [ "$attempt" -lt 3 ] || die "push still rejected after 3 rebases"
  echo "pr-assets: push rejected, rebasing (retry $((attempt + 1))/3)" >&2
  git pull --quiet --rebase origin "$branch"
done

for f in "$@"; do
  file=$(basename "$f")
  url="$raw/pr-$pr/$file"
  case "${file,,}" in
    *.png | *.gif | *.jpg | *.jpeg | *.webp) echo "![$file]($url)" ;;
    *) echo "[$file]($url)" ;;
  esac
done
