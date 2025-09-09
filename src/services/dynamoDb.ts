//aws sso login --profile (process.env.AWS_PROFILE) - log in
// aws sts get-caller-identity --profile (PROFILE NAME) - check if need to log in again
// aws dynamodb list-tables --profile (PROFILE_NAME) - show tables to confirm connection


import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, PutCommand, } from "@aws-sdk/lib-dynamodb";
// GetCommand, UpdateCommand, DeleteCommand
import { v4 as uuid } from 'uuid';
import { Memory } from '../app/components/memoryForm';

const dbClient = new DynamoDBClient({
    // dont need credentials as AWS SDK will use SSO
    region: process.env.AWS_REGION || 'us-east-1'
});
// Higher level wrapper for dbClient - simpler more readable code
const docClient = DynamoDBDocumentClient.from(dbClient);

//Save to database logic
export const createMemory = async (memForm: Memory) => {
    try {
        // Create first to assure TS Item will have content (we have checked for this in memForm).
        const memId = uuid();
        const put = new PutCommand({
            TableName: process.env.TABLE_NAME,
            Item: {
                mem_id: memId,
                // Already typeguard in memoryForm.tsx
                Text: memForm['text-area'],
                // Set to tell Dynamo its a string set so we get clean instead of raw data.
                // Split list of individuals and filter Boolean to remove empty or undefined values.
                mem_tags: new Set([memForm.title, memForm.year, ...(memForm.tagged ? memForm.tagged.split(',').map(name => name.trim()): [])].filter(Boolean)) || [],
                //user_id: (when added auth)
            }
        });
        
        await docClient.send(put);
        return { success: true, id: memId };
    } catch (err) {
        console.error(`Could not store memory: `, err);
        throw err;
    }
}

export const deleteMemory = async (memId: string) => {
    try {
        const del = new DeleteCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                mem_id: memId
            }
        });

        await docClient.send(del);
        return { success: true, id: memId };

    } catch (err) {
        console.error(`Couldn't delete memory: `, err);
        throw err;
    }
}
