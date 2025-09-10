import boto3
import os
from botocore.exceptions import ClientError
from uuid import uuid4

dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION'))

table = dynamodb.Table(os.getenv('TABLE_NAME'))

async def test_connection():
    '''Test basic DynamoDb connection'''
    try:
        response = table.meta.client.describe_table(TableName=os.getenv('TABLE_NAME'))
        print(f"✅ Connected to table: {response['Table']['TableName']}")
        print(f"📊 Table status: {response['Table']['TableStatus']}")
        return True
    except ClientError as err:
        print(f"❌ Connection failed: {err}")
        return False

async def create_memory(memory_data: dict) -> dict:
    try:
        mem_Id = str(uuid4())
        # Process tags
        tags = []
        if memory_data.get('title'):
            tags.append(memory_data['title'])
        if memory_data.get('year'):
            tags.append(memory_data['year'])
        if memory_data.get('tagged'):
            tagged = [tag.strip() for tag in memory_data['tagged'].split(',') if tag.strip()]
            tags.extend(tagged)

        item = {
            'mem_id': mem_Id,
            'Text': memory_data['text_area'],
            'mem_tags': tags # List instead of set (DynamoDB handles)
        }

        table.put_item(Item=item)

        return {'success': True, 'id': mem_Id}
    
    except ClientError as err:
        # Handle AWS errors
        print(f'Couldn\'t store memory: {err}')
        return {
            'success': False,
            'error': 500,
            'errorMessage': f'Database error: { str(err) }'
        }
    except Exception as err:
        # Other errors
        error_msg = f"{type(err).__name__}: An unexpected error occurred"
        print(f'Unexpected error: {error_msg}')
        return {'success': False, 'error': 500, 'errorMessage': error_msg}
    

# aws sso login --profile (process.env.AWS_PROFILE) - log in
# aws sts get-caller-identity --profile (PROFILE NAME) - check if need to log in again
# aws dynamodb list-tables --profile (PROFILE_NAME) - show tables to confirm connection

# Key Differences: TypeScript → Python
# TypeScript	                   Python
# @aws-sdk/client-dynamodb	        boto3
# PutCommand	                table.put_item()
# uuid()	                     uuid.uuid4()
# Set([...])	                  set([...])