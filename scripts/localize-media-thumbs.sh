#!/bin/bash
# Purpose: Download Unsplash media-card photos and emit local jpg/webp/avif.
# Input: Unsplash photo IDs (hardcoded). Output: assets/media-*.{jpg,webp,avif}
# Run with: bash scripts/localize-media-thumbs.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS="$ROOT/assets"
mkdir -p "$ASSETS"

download() {
  local id="$1" name="$2"
  local jpg="$ASSETS/${name}.jpg"
  echo "fetch $name"
  curl -fsSL -o "$jpg" \
    "https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=82"
  sips -s format jpeg -s formatOptions 82 "$jpg" >/dev/null
  cwebp -q 78 "$jpg" -o "$ASSETS/${name}.webp" >/dev/null
  ffmpeg -y -i "$jpg" -c:v libaom-av1 -still-picture 1 -crf 32 -cpu-used 6 \
    "$ASSETS/${name}.avif" >/dev/null 2>&1
}

download "photo-1647221597837-ff41b73a7f54" "media-winning-together"
download "photo-1739932885175-5fdaa1bd5989" "media-od-yad"
download "photo-1576696058573-12b47c49559e" "media-channel10"
download "photo-1508921340878-ba53e1f016ec" "media-walla"
download "photo-1571645163064-77faa9676a46" "media-conference"

ls -lh "$ASSETS"/media-*
