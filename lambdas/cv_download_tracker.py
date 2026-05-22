"""
Lambda: cv-download-tracker
───────────────────────────
Triggered by: API Gateway GET /cv/download
Action:
  1. Logs the download event to DynamoDB (table: cv-downloads)
  2. Returns a pre-signed S3 URL that the browser immediately
     follows to download the CV PDF.

DynamoDB schema (table: cv-downloads, pk: download_id)
  download_id  String   UUID v4
  timestamp    String   ISO 8601 UTC
  ip           String   CloudFront viewer IP (X-Forwarded-For)
  referrer     String   HTTP Referer header (LinkedIn, Google, etc.)
  user_agent   String   Browser UA string
  source       String   ?source= query param (e.g. "linkedin", "recruiter")

Environment variables (set in Lambda console):
  S3_BUCKET        Your existing S3 bucket name
  CV_S3_KEY        Key of the CV PDF, e.g. "CV_English_JordanNguyen.PDF"
  DYNAMO_TABLE     DynamoDB table name, default "cv-downloads"
  URL_EXPIRY_SECS  Pre-signed URL expiry, default 60
"""

import os
import uuid
import json
import boto3
import logging
from datetime import datetime, timezone

logger = logging.getLogger()
logger.setLevel(logging.INFO)

S3_BUCKET       = os.environ["S3_BUCKET"]
CV_S3_KEY       = os.environ.get("CV_S3_KEY", "CV_English_JordanNguyen.PDF")
DYNAMO_TABLE    = os.environ.get("DYNAMO_TABLE", "cv-downloads")
URL_EXPIRY_SECS = int(os.environ.get("URL_EXPIRY_SECS", "60"))

s3       = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")
table    = dynamodb.Table(DYNAMO_TABLE)

CORS_HEADERS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
}


def handler(event, context):
    # ── CORS preflight ────────────────────────────────────────────────
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    try:
        # ── Extract request metadata ──────────────────────────────────
        headers     = event.get("headers") or {}
        qs          = event.get("queryStringParameters") or {}
        ip          = headers.get("X-Forwarded-For", "unknown").split(",")[0].strip()
        referrer    = headers.get("Referer", headers.get("referer", "direct"))
        user_agent  = headers.get("User-Agent", "unknown")
        source      = qs.get("source", "unknown")   # ?source=linkedin

        download_id = str(uuid.uuid4())
        timestamp   = datetime.now(timezone.utc).isoformat()

        # ── Log to DynamoDB ───────────────────────────────────────────
        table.put_item(Item={
            "download_id": download_id,
            "timestamp":   timestamp,
            "ip":          ip,
            "referrer":    referrer,
            "user_agent":  user_agent,
            "source":      source,
        })
        logger.info(f"CV download logged: {download_id} from {ip} via {source}")

        # ── Generate pre-signed download URL ─────────────────────────
        presigned_url = s3.generate_presigned_url(
            "get_object",
            Params={
                "Bucket":                     S3_BUCKET,
                "Key":                        CV_S3_KEY,
                "ResponseContentDisposition": "attachment; filename=CV_JordanNguyen.pdf",
                "ResponseContentType":        "application/pdf",
            },
            ExpiresIn=URL_EXPIRY_SECS,
        )

        # ── Redirect browser to the file ─────────────────────────────
        return {
            "statusCode": 302,
            "headers": {
                **CORS_HEADERS,
                "Location": presigned_url,
            },
            "body": "",
        }

    except Exception as exc:
        logger.error(f"CV download tracker error: {exc}", exc_info=True)
        # Graceful fallback — redirect directly to S3 public URL so the
        # download still works even if logging fails
        fallback = f"https://{S3_BUCKET}.s3.amazonaws.com/{CV_S3_KEY}"
        return {
            "statusCode": 302,
            "headers": {**CORS_HEADERS, "Location": fallback},
            "body": "",
        }
