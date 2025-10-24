// src/app/api/reya/positions/[address]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPositions } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get('page')) || 1;
  const perPage = Number(searchParams.get('perPage')) || 300;
  const accountId = searchParams.get('accountId');

  if (!accountId) {
    return NextResponse.json(
      { error: 'accountId is required' },
      { status: 400 }
    );
  }
  
  try {
    const positions = await getPositions(
      params.address,
      accountId,
      page,
      perPage
    );
    return NextResponse.json({ data: positions });
  } catch (error) {
    console.error('[Route] Positions fetch error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch positions';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
