import { NextRequest, NextResponse } from 'next/server';
import { createMemory } from '@/services/dynamoDb';


// Handle saving memories to the database, liasing with the frontend
export async function POST(request: NextRequest) {
  try {
    const memory = await request.json();

    if (!memory || !memory['text-area']) {
      return NextResponse.json({
        success: false,
        error: 400,
        errorMessage: 'No memory text detected',
      });
      }
    
    const result = await createMemory(memory);
    return NextResponse.json({ success: true, memId: result.id });
      
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: 500,
        errorMessage: err,
      },
      { status: 500 }
    );
  }
}
