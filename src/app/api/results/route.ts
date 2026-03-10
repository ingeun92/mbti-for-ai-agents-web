import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashIp } from '@/lib/hash';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// The scoring logic will be imported from @mbti/shared
// For now, compute scores inline or import when available

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // Rate limiting
    const { allowed, remaining } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { status: 'error', error: 'Rate limit exceeded. Try again later.' },
        { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
      );
    }

    const body = await request.json();
    const { aiPrompt, answers } = body;

    // Validation
    if (!aiPrompt || typeof aiPrompt !== 'string') {
      return NextResponse.json(
        { status: 'error', error: 'aiPrompt is required and must be a string' },
        { status: 400 }
      );
    }
    if (!Array.isArray(answers) || answers.length !== 60) {
      return NextResponse.json(
        { status: 'error', error: 'answers must be an array of 60 numbers' },
        { status: 400 }
      );
    }
    if (!answers.every((a: unknown) => typeof a === 'number' && a >= 1 && a <= 7 && Number.isInteger(a))) {
      return NextResponse.json(
        { status: 'error', error: 'Each answer must be an integer between 1 and 7' },
        { status: 400 }
      );
    }

    // Import scoring from shared package
    // Using dynamic import to handle the case where shared package may not be built yet
    const { computeScores, determineMbtiType } = await import('@mbti/shared');

    const scores = computeScores(answers);
    const mbtiResult = determineMbtiType(scores);

    // Store in DB
    const test = await prisma.test.create({
      data: {
        ipAddress: hashIp(ip),
        aiPrompt,
        mbtiResult,
        scores: { ...scores },
      },
    });

    const baseUrl = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const resultUrl = `${protocol}://${baseUrl}/result/${test.id}`;

    return NextResponse.json(
      { status: 'success', resultUrl },
      {
        status: 201,
        headers: { 'X-RateLimit-Remaining': remaining.toString() },
      }
    );
  } catch (error) {
    console.error('Error creating test result:', error);
    return NextResponse.json(
      { status: 'error', error: 'Internal server error' },
      { status: 500 }
    );
  }
}
