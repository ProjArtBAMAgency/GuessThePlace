#!/usr/bin/env bash
set -euo pipefail

# Creates 15 posts with Swiss coordinates and validates them using the
# existing authenticated cookie stored at /tmp/cookies.txt

BASE_URL="http://localhost:3000/api/v1"
COOKIE_FILE="/tmp/cookies.txt"
IMG_DIR="$(dirname "$0")/../tmp_images"

names=("Zurich" "Geneva" "Lausanne" "Bern" "Lugano" "Lucerne" "Basel" "StGallen" "Interlaken" "Davos" "Zermatt" "Montreux" "Neuchatel" "Sion" "Fribourg")

lats=(47.3769 46.2044 46.5197 46.9480 46.0037 47.0502 47.5596 47.4245 46.6863 46.8028 46.0207 46.4325 46.9929 46.2330 46.8037)

lons=(8.5417 6.1432 6.6323 7.4474 8.9511 8.3093 7.5886 9.3760 7.8632 9.8380 7.7491 6.9100 6.9293 7.3570 7.1610)

for i in $(seq 0 14); do
  idx=$((i+1))
  name=${names[$i]}
  lat=${lats[$i]}
  lon=${lons[$i]}
  img="$IMG_DIR/img${idx}.jpg"

  echo "Creating post $idx: $name ($lat,$lon) -> $img"

  res=$(curl -s -b "$COOKIE_FILE" -F "placeName=$name" -F "latitude=$lat" -F "longitude=$lon" -F "picture=@$img" "$BASE_URL/posts")
  id=$(echo "$res" | jq -r '._id')
  if [ -z "$id" ] || [ "$id" = "null" ]; then
    echo "Failed to create post: $res"
    exit 1
  fi

  echo "Created post id $id — validating..."
  curl -s -b "$COOKIE_FILE" -X PATCH -H "Content-Type: application/json" -d '{"isValidated":true}' "$BASE_URL/posts/$id" >/dev/null
  echo "Post $id validated"
  sleep 0.2
done

# final count
count=$(curl -s -b "$COOKIE_FILE" "$BASE_URL/posts?isValidated=true&limit=100" | jq '. | length')
echo "Total validated posts visible: $count"
