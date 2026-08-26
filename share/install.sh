#!/bin/bash
# install.sh — post-install script for omarchy-strudel
# Sets up user config directory, copies bundled songs, enables systemd service.
set -euo pipefail

CONFIG_DIR="${HOME}/.config/omarchy-strudel"
SONGS_DIR="${CONFIG_DIR}/songs"
CUSTOM_DIR="${SONGS_DIR}/custom"
SHARE_DIR="/usr/share/omarchy-strudel"

mkdir -p "$CONFIG_DIR" "$SONGS_DIR" "$CUSTOM_DIR" "${HOME}/.local/state/omarchy-strudel"

if [[ ! -f "${CONFIG_DIR}/config.json" ]]; then
  cp "${SHARE_DIR}/default-config.json" "${CONFIG_DIR}/config.json"
fi

if [[ -d "${SHARE_DIR}/songs" ]]; then
  for song in "${SHARE_DIR}/songs"/*.js; do
    [[ -f "$song" ]] || continue
    filename="$(basename "$song")"
    if [[ ! -f "${SONGS_DIR}/${filename}" ]]; then
      cp "$song" "${SONGS_DIR}/${filename}"
    fi
  done
fi

systemctl --user daemon-reload 2>/dev/null || true
systemctl --user enable omarchy-strudel.service 2>/dev/null || true

echo "omarchy-strudel installed successfully."
echo ""
echo "To start playing now:  omarchy-strudel play"
echo "To open the menu:      omarchy-strudel menu"
echo "To enable autostart:   systemctl --user enable omarchy-strudel.service"
echo ""
echo "For the menubar icon, install the Omarchy shell plugin:"
echo "  omarchy plugin add https://github.com/<user>/omarchy-strudel-bar.git --enable --yes"
