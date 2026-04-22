#!/bin/bash
# GA4 Measurement ID deployment script
# Usage: ./ga4-deploy.sh G-YOURMEASUREMENTID
# Run this once you have the GA4 Measurement ID from analytics.google.com

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 G-YOURMEASUREMENTID"
  echo "Get your Measurement ID from: Google Analytics > Admin > Data Streams > Web stream"
  exit 1
fi

NEW_ID="$1"
SITE_DIR="/var/www/aimastertools.com"

if [[ ! "$NEW_ID" =~ ^G-[A-Z0-9]+$ ]]; then
  echo "Error: ID must match format G-XXXXXXXXXX (e.g. G-ABC123DEF4)"
  exit 1
fi

echo "Deploying GA4 Measurement ID: $NEW_ID"

# Replace placeholder ID - only in the var assignment line, not in the sentinel check
sed -i "s|var GA4_ID = 'G-XXXXXXXXXX';|var GA4_ID = '$NEW_ID';|" "$SITE_DIR/analytics.js"
# Activate tracking (set GA4_READY to true)
sed -i "s|var GA4_READY = GA4_ID !== 'G-XXXXXXXXXX';|var GA4_READY = true; // ID is live|" "$SITE_DIR/analytics.js"

echo "Deployed. Verifying..."
grep -n "GA4_ID\|GA4_READY" "$SITE_DIR/analytics.js" | head -5

echo ""
echo "Next steps:"
echo "1. Commit: cd $SITE_DIR && git add analytics.js && git commit -m 'feat: activate GA4 measurement ID $NEW_ID' && git push"
echo "2. Check realtime at: https://analytics.google.com/analytics/web/#/p526378056/reports/overview"
