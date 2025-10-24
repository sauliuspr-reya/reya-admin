import { NextResponse } from 'next/server';
import { getPositions } from '@/lib/api';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string; accountId: string }> }
) {
  try {
    const { address, accountId } = await params;
    
    // Parse query parameters safely
    const searchParams = new URLSearchParams(request.url.split('?')[1] || '');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '300', 10);

    // Validate parameters
    if (!address || !accountId) {
      return NextResponse.json(
        { error: 'Address and accountId are required' },
        { status: 400 }
      );
    }

    const positions = await getPositions(
      address,
      accountId,
      page,
      perPage
    );

    return NextResponse.json(positions);
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}
