import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Persistence will be added after auth is implemented
  return NextResponse.json(
    { error: 'Not implemented — persistence requires auth', id },
    { status: 501 }
  );
}
