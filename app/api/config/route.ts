import { NextResponse } from 'next/server';

/**
 * GET /api/config
 * Exposes public environment variables to the client
 */
export async function GET() {
  return NextResponse.json({
    geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
    universityName: process.env.UNIVERSITY_NAME || 'University Portal',
  });
}
