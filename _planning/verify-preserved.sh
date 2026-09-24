#!/usr/bin/env bash
# Checks that every preserved path on worldwiderad.com is still served byte for byte.
# Usage: bash _planning/verify-preserved.sh [base-url]
set -u
BASE="${1:-https://worldwiderad.com}"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
fail=0

while read -r want path; do
  [ -z "$path" ] && continue
  code=$(curl -s -o "$TMP" -w '%{http_code}' --max-time 60 "$BASE/$path")
  got=$(sha256sum "$TMP" | cut -d' ' -f1)
  if [ "$code" = 200 ] && [ "$got" = "$want" ]; then
    echo "OK    $path"
  else
    echo "FAIL  $path (HTTP $code, sha256 $got)"; fail=1
  fi
done <<'EOF'
312f179fb1985b93fee7b4968d889ac8adf915cf72c6381498619b48df676fab IEEEv39.pdf
01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b README.md
5b705d5e5c4a0f7ea01f3106499d652bf0548fdd76281447a57c71048096a01e hackathon/index.html
5add6b397b2dff9bddbab1182f9dea1ec6ab233e12bd1c80f1b4ebaf3e6cf804 images/BLISS1.png
dfdc96bcf5da880bedaef87883cd2179cd4b677cc26644b5a0721d0da1c2c4e3 images/Thejourneyalbumcover.png
d9532d837a1431594053a55799bbe040bf0c27a47c811770da702153f47df126 images/UntitledTrifoldBrochure.svg
5aa79279d4af76b9f87196227a4bb59c64ec3eb488f017c5e515b67260a9ff81 images/Untitleddesign4.png
26cf65fd50a7f8a05154d8e5a6c5cc94302a2bded4fcca8bd4dc331e140c14de images/default-logo.png
e47ff22a0be41ee8fa603bc9c90873e16638fd1589565aa6cfef9d4efeba65a9 images/pexelsphoto3532803.jpg
aedb51d853a45f383b5f925f8fd700ff08e89c42d4992169b3497e5dc372ec3f jlec-form/dash.html
9aa28a66fa9842ad1072daf086226c547cd1fd0c76c4eaa8698aa515080cded4 jlec-form/data.csv
0168577a3ebd0bcd5d0282ae824c689b933648d0e547736857ccaeac276f9d73 jlec-form/index.html
EOF

# Directory URLs must still resolve, and planning notes must never be published.
for path in jlec-form/ hackathon/; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "$BASE/$path")
  [ "$code" = 200 ] && echo "OK    /$path" || { echo "FAIL  /$path (HTTP $code)"; fail=1; }
done
code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "$BASE/_planning/SITE_INVENTORY.md")
[ "$code" = 404 ] && echo "OK    /_planning/ not published" || { echo "FAIL  /_planning/ is published (HTTP $code)"; fail=1; }

exit $fail
