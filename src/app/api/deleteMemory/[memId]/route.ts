import { NextRequest, NextResponse } from 'next/server';
import { deleteMemory } from '@/services/dynamoDb';

// [memId] folder is part of the routing, the file structure Is the router in Next.js. Bracket syntax is how Next.js knows to make the URL segment available in the params object.

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ memId: string }> }
){
  try {
    const { memId } = await context.params;

    if (!memId) {
      return NextResponse.json(
        {
          success: false,
          error: 400,
          errorMessage: 'Memory ID required',
        },
        { status: 400 }
      );
    }

    await deleteMemory(memId);

    return NextResponse.json(
      { success: true, memId: memId },
      { status: 200 }
    );
  } catch (err) {
    console.error('Unable to delete the memory: ', err);
    return NextResponse.json(
      {
        success: false,
        error: 500,
        errorMessage: 'Unable to delete the memory',
      },
      { status: 500 }
    );
  }
}
