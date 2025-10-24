// src/app/api/reya/accounts/[address]/route.ts
import { NextResponse } from 'next/server';
import { getAccounts } from '@/lib/api';

export async function GET(
  request: Request,
  context: { params: Promise<{ address: string }> }
) {
  const params = await context.params;
  
  try {
    const accounts = await getAccounts(params.address);
    
    return NextResponse.json({ data: accounts });
  } catch (error) {
    console.error('[Route] Account fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}
