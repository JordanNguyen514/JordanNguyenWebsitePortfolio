import boto3
import os

def lambda_handler(event, context):
    # Retrieve the distribution ID from environment variables
    cf_distribution_id = os.environ['CF_DISTRIBUTION_ID']

    # Create a CloudFront client
    client = boto3.client('cloudfront')

    # Invalidate the cache for all paths
    invalidation = client.create_invalidation(
        DistributionId=cf_distribution_id,
        InvalidationBatch={
            'Paths': {
                'Quantity': 1,
                'Items': ['/*']
            },
            'CallerReference': context.aws_request_id
        }
    )

    return {
        'statusCode': 200,
        'body': 'Cache invalidation created successfully.'
    }