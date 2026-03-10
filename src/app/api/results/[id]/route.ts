import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const test = await prisma.test.findUnique({
      where: { id },
    });

    if (!test) {
      return NextResponse.json(
        { status: 'error', error: 'Result not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: test.id,
      aiPrompt: test.aiPrompt,
      mbtiResult: test.mbtiResult,
      scores: test.scores,
      createdAt: test.createdAt,
    });
  } catch (error) {
    console.error('Error fetching test result:', error);
    return NextResponse.json(
      { status: 'error', error: 'Internal server error' },
      { status: 500 }
    );
  }
}
