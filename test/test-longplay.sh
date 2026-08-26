#!/bin/bash
# test-longplay.sh — Play the coastline song for a longer duration to catch
# errors that only appear after the first few seconds (choppiness, etc.)
# Usage: bash test/test-longplay.sh [duration_seconds]
set -euo pipefail

cd "$(dirname "$0")/.."

DURATION="${1:-60}"
RESULTS="test/longplay-results.txt"

echo "=== omarchy-strudel longplay test ===" > "$RESULTS"
echo "Date: $(date -u '+%Y-%m-%dT%H:%M:%SZ')" >> "$RESULTS"
echo "Duration: ${DURATION}s" >> "$RESULTS"
echo "Node: $(node --version 2>/dev/null || echo 'not found')" >> "$RESULTS"
echo "" >> "$RESULTS"

echo "=== Longplay test: coastline for ${DURATION}s ===" | tee -a "$RESULTS"
echo "Listen for choppiness. All errors below are logged." | tee -a "$RESULTS"

timeout $((DURATION + 15)) node test/play-long.mjs "$DURATION" 2>&1 | tee -a "$RESULTS"

echo "" >> "$RESULTS"
echo "=== Longplay test done ===" | tee -a "$RESULTS"
echo ""
echo "Results saved to test/longplay-results.txt"
echo "To sync back: git add test/longplay-results.txt && git commit -m 'Longplay results' && git push"
