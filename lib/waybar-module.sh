#!/bin/bash
# waybar-module.sh — Legacy Waybar custom module for omarchy-strudel
# Outputs Waybar-style JSON for display in the bar.
# Add to waybar config as a custom module:
#   "custom/omarchy-strudel": {
#     "exec": "/usr/lib/omarchy-strudel/waybar-module.sh",
#     "interval": 2,
#     "on-click": "omarchy-strudel-menu",
#     "on-click-right": "omarchy-strudel play",
#     "scroll-step": 0.05
#   }

set -euo pipefail

STATUS="$(omarchy-strudel status 2>/dev/null || echo '{"ok":false}')"

OK="$(echo "$STATUS" | jq -r '.ok // false' 2>/dev/null || echo "false")"
STATE="$(echo "$STATUS" | jq -r '.state // "unknown"' 2>/dev/null || echo "unknown")"
SONG="$(echo "$STATUS" | jq -r '.song // ""' 2>/dev/null || echo "")"
ARTIST="$(echo "$STATUS" | jq -r '.artist // ""' 2>/dev/null || echo "")"
ENABLED="$(echo "$STATUS" | jq -r '.enabled // true' 2>/dev/null || echo "true")"

TEXT=""
CLASS=""
TOOLTIP=""

if [[ "$ENABLED" != "true" ]]; then
  TEXT="mute"
  CLASS="disabled"
  TOOLTIP="omarchy-strudel (disabled)"
elif [[ "$STATE" == "playing" ]]; then
  TEXT="󰝚"
  CLASS="playing"
  if [[ -n "$ARTIST" ]]; then
    TOOLTIP="${SONG} — ${ARTIST}"
  else
    TOOLTIP="${SONG}"
  fi
elif [[ "$STATE" == "paused" ]]; then
  TEXT="󰏥"
  CLASS="paused"
  TOOLTIP="${SONG} (paused)"
elif [[ "$STATE" == "stopped" ]]; then
  TEXT="󰝟"
  CLASS="stopped"
  TOOLTIP="omarchy-strudel (stopped)"
else
  TEXT="󰝟"
  CLASS="error"
  TOOLTIP="omarchy-strudel (no daemon)"
fi

jq -nc --arg text "$TEXT" --arg class "$CLASS" --arg tooltip "$TOOLTIP" \
  '{text: $text, class: $class, tooltip: $tooltip}'
