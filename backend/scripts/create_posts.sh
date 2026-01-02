#!/usr/bin/env bash
set -e
TMPDIR=/tmp/guesstheplace_imgs
rm -rf "$TMPDIR" && mkdir -p "$TMPDIR"
IMG_BASE="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="
for i in $(seq 1 15); do echo "$IMG_BASE" | base64 --decode > "$TMPDIR/img_$i.png"; done
coords=(
"47.3769,8.5417"
"46.2044,6.1432"
"46.9480,7.4474"
"46.5197,6.6323"
"47.0502,8.3093"
"47.5596,7.5886"
"47.4245,9.3767"
"46.0037,8.9511"
"47.1369,7.2460"
"46.7519,7.6211"
"46.6863,7.8632"
"46.2333,7.3500"
"46.8508,9.5305"
"47.5010,8.7241"
"46.8065,7.1612"
)
ids_file=/tmp/guesstheplace_post_ids.txt
: > "$ids_file"
for i in $(seq 1 15); do
  latlon=${coords[$((i-1))]}
  lat=${latlon%,*}
  lon=${latlon#*,}
  echo "Creating post $i at $lat,$lon"
  res=$(curl -s -b /tmp/cookies.txt -F "placeName=Test Place $i" -F "latitude=$lat" -F "longitude=$lon" -F "picture=@$TMPDIR/img_$i.png" http://localhost:3000/api/v1/posts)
  id=$(echo "$res" | jq -r '._id')
  if [ "$id" = "null" ] || [ -z "$id" ]; then
    echo "Failed to create post $i: $res"
    exit 1
  fi
  echo "$id" >> "$ids_file"
  echo "Created post id=$id"
done

while read -r id; do
  echo "Validating post $id"
  curl -s -b /tmp/cookies.txt -X PATCH -H "Content-Type: application/json" -d '{"isValidated":true}' http://localhost:3000/api/v1/posts/$id > /dev/null
  echo "Validated $id"
done < "$ids_file"

count=$(curl -s -b /tmp/cookies.txt "http://localhost:3000/api/v1/posts?isValidated=true&limit=15" | jq '. | length')

echo "Validated posts returned (limit=15): $count"
