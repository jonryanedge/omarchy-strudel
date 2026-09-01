#!/bin/bash
# dev-setup.sh — Set up symlinks + systemd unit for development testing
# Usage: sudo bash scripts/dev-setup.sh
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run with sudo: sudo bash scripts/dev-setup.sh" >&2
  exit 1
fi

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LIB_DIR="/usr/lib/omarchy-strudel"

echo "Repo: $REPO_DIR"

# Main library symlink (node_modules resolvable via real path)
ln -sfn "$REPO_DIR" "$LIB_DIR"

# CLI entry points
ln -sfn "$REPO_DIR/bin/omarchy-strudel" /usr/bin/omarchy-strudel
ln -sfn "$REPO_DIR/bin/omarchy-strudel-daemon" /usr/bin/omarchy-strudel-daemon
ln -sfn "$REPO_DIR/bin/omarchy-strudel-play" /usr/bin/omarchy-strudel-play
ln -sfn "$REPO_DIR/bin/omarchy-strudel-menu" /usr/bin/omarchy-strudel-menu

# systemd user unit
install -Dm644 "$REPO_DIR/systemd/omarchy-strudel.service" \
  /etc/systemd/user/omarchy-strudel.service

echo ""
echo "Dev environment installed. Next steps (as your user):"
echo ""
echo "  systemctl --user daemon-reload"
echo "  systemctl --user enable --now omarchy-strudel"
echo "  systemctl --user status omarchy-strudel"
echo ""
echo "  omarchy-strudel status"
echo "  omarchy-strudel-play coastline 15"
echo ""
echo "To stop:    systemctl --user stop omarchy-strudel"
echo "To disable: systemctl --user disable omarchy-strudel"
