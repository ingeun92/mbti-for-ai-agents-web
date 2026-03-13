import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      aiPrompt, answers, modelProvider, modelName, modelVersion, agentName, temperature,
      questionDetails, totalRetries, totalLatencyMs, avgLatencyMs,
      runIndex, totalRuns,
      truthfulQA,
    } = body;

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

    const { computeScores, determineMbtiType } = await import('@mbti/shared');

    const scores = computeScores(answers);
    const mbtiResult = determineMbtiType(scores);

    const test = await prisma.test.create({
      data: {
        aiPrompt,
        mbtiResult,
        scores: { ...scores },
        rawAnswers: answers,
        modelProvider: modelProvider || null,
        modelName: modelName || null,
        modelVersion: modelVersion || null,
        agentName: agentName || null,
        temperature: typeof temperature === 'number' ? temperature : null,
        // Telemetry
        questionDetails: Array.isArray(questionDetails) ? questionDetails : undefined,
        totalRetries: typeof totalRetries === 'number' ? totalRetries : null,
        totalLatencyMs: typeof totalLatencyMs === 'number' ? totalLatencyMs : null,
        avgLatencyMs: typeof avgLatencyMs === 'number' ? avgLatencyMs : null,
        // Repeat runs
        runIndex: typeof runIndex === 'number' ? runIndex : null,
        totalRuns: typeof totalRuns === 'number' ? totalRuns : null,
        // TruthfulQA benchmark
        truthfulQA: truthfulQA && typeof truthfulQA === 'object' ? truthfulQA : undefined,
      },
    });

    const baseUrl = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const resultUrl = `${protocol}://${baseUrl}/result/${test.id}`;

    return NextResponse.json(
      { status: 'success', resultUrl },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating test result:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { status: 'error', error: 'Internal server error' },
      { status: 500 }
    );
  }
}
