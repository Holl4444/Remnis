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
        print(f"Connected to table: {response['Table']['TableName']}")
        print(f"Table status: {response['Table']['TableStatus']}")
        return True
    except ClientError as err:
        print(f"Connection failed: {err}")
        return False

async def create_memory(memory_data: dict) -> dict:
    try:
        print(f"AWS_REGION: {os.getenv('AWS_REGION')}")
        print(f"TABLE_NAME: {os.getenv('TABLE_NAME')}")
        print(f"AWS_PROFILE: {os.getenv('AWS_PROFILE')}")
        
        mem_Id = str(uuid4())
        print(f"Creating memory with ID: {mem_Id}")
        
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
            'text': memory_data['text_area'],
            'mem_tags': tags # List instead of set (DynamoDB handles)
        }
        
        print(f"Saving item to DynamoDB: {item}")
        table.put_item(Item=item)
        print(f"Successfully saved memory: {mem_Id}")

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
    

async def delete_memory(mem_id: str) -> dict:
    try:
        response = table.delete_item(
            Key={'mem_id': mem_id},
            ReturnValues='ALL_OLD'  # Returns the deleted item if it existed - configuration parameter
        )
        
        if 'Attributes' in response:
            return {'success': True, 'id': mem_id}
        else:
            return {
                'success': False,
                'error': 404,
                'errorMessage': 'Memory not found'
            }
    
    except ClientError as err:
        print(f'Couldn\'t delete memory: {err}')
        return {
            'success': False,
            'error': 500,
            'errorMessage': f'Database error: {str(err)}'
        }
    except Exception as err:
        error_msg = f"{type(err).__name__}: An unexpected error occurred"
        print(f'Unexpected error: {error_msg}')
        return {'success': False, 'error': 500, 'errorMessage': error_msg}

# Need to 'paginate' later    
async def get_memories() -> dict:
    try:
        response = table.scan()
        memories = response.get('Items', []) # (response['Items'] with safe return of empty list if key missing) Converted from DynamoDb format to list of python dicts by boto3

        # Validate response structure
        if not isinstance(memories, list):
            return {'success': False, 'error': 500, 'errorMessage': 'Invalid response format'}
        
        transformed_memories = []
        for item in memories:
            transformed_memories.append(
                {
                    'memId': item['mem_id'],
                    'text': item['text'],
                    'memTags': item['mem_tags']
                }
            )
        
        return  {'success': True,
                 'memories': transformed_memories, 
                 'count': len(transformed_memories)}
    
    except ClientError as err: # AWS / DynamoDb errors
        error_message = err.response['Error']['Message']
        error_msg = f'Database error: {error_message}'
        print(f'Couldn\'t retrieve memories: {error_msg}')
        return {
            'success': False,
            'error': 500,
            'errorMessage': f'Database error: { str(err) }'
        }
    except Exception as err:
        error_msg = str(err) or f'{type(err).__name__}'
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