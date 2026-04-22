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

# Replace placeholder in analytics.js
sed -i "s|G-XXXXXXXXXX|$NEW_ID|g" "$SITE_DIR/analytics.js"

echo "Deployed. Verifying..."
grep "GA4_ID" "$SITE_DIR/analytics.js" | head -3

echo ""
echo "Next steps:"
echo "1. Commit and push: cd $SITE_DIR && git add analytics.js && git commit -m 'feat: activate GA4 measurement ID $NEW_ID' && git push"
echo "2. Verify tracking at: https://analytics.google.com/analytics/web/#/p<PROPERTY_ID>/reports/overview"
echo "3. Use GA4 Realtime report to confirm events are firing"
