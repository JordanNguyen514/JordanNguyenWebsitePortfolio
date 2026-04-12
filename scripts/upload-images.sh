#!/bin/bash
# ============================================================
#  scripts/upload-images.sh
#  Upload all portfolio images to S3 (run once, or when adding new images)
# ============================================================
#
#  CONCEPT
#  --------
#  Images are large, rarely change, and don't belong in Git.
#  This script uploads them directly to S3 with long-lived
#  cache headers so CloudFront serves them efficiently forever.
#
#  After running this script:
#    1. Images are at https://d2kmkdebgfkxyh.cloudfront.net/assets/img/...
#    2. You can safely delete assets/img/ from your local machine
#    3. The .gitignore already excludes assets/img/ from future commits
#
#  Prerequisites:
#    - AWS CLI installed: https://aws.amazon.com/cli/
#    - Configured: aws configure  (use your AWS credentials)
#    - Run from the project root: bash scripts/upload-images.sh
#
# ============================================================

set -e  # Exit on any error

BUCKET="${AWS_S3_BUCKET:-your-bucket-name}"  # Override with: AWS_S3_BUCKET=mybucket bash scripts/upload-images.sh
IMG_DIR="./assets/img"
S3_PREFIX="assets/img"

# Check assets/img exists locally before uploading
if [ ! -d "$IMG_DIR" ]; then
  echo "❌  $IMG_DIR not found. Make sure you're running from the project root."
  exit 1
fi

echo ""
echo "📦 Uploading portfolio images to S3..."
echo "   Bucket: s3://${BUCKET}/${S3_PREFIX}/"
echo "   Source: ${IMG_DIR}/"
echo ""

# Upload with:
#   --cache-control max-age=31536000  →  1 year cache (images are immutable)
#   --acl public-read                 →  publicly accessible via CloudFront
#   Only upload image file types (skip any accidental non-image files)

aws s3 sync "$IMG_DIR" "s3://${BUCKET}/${S3_PREFIX}/" \
  --cache-control "max-age=31536000, public, immutable" \
  --exclude "*" \
  --include "*.jpg" \
  --include "*.jpeg" \
  --include "*.png" \
  --include "*.gif" \
  --include "*.webp" \
  --include "*.svg" \
  --include "*.ico"

echo ""
echo "✅ Upload complete!"
echo ""
echo "Your images are now live at:"
echo "   https://d2kmkdebgfkxyh.cloudfront.net/assets/img/"
echo ""
echo "Next steps:"
echo "  1. Verify a few images load: open the URL above in your browser"
echo "  2. You can now delete assets/img/ from your local machine (it's in .gitignore)"
echo "  3. To add new images in future: drop them in assets/img/ and re-run this script"
echo ""
