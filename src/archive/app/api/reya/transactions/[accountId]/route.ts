// src/app/api/reya/transactions/[accountId]/route.ts
import { NextResponse } from 'next/server';
import { getTransactions } from '@/lib/api';

export async function GET(
  request: Request,
  context: { params: { accountId: string } }
) {
  const { params } = context;
  console.log(`[API] Fetching transactions for account: ${params.accountId}`);
  
  try {
    const transactions = await getTransactions(Number(params.accountId));
    
    // Transform the data for UI display
    const uiTransactions = transactions.map(tx => ({
      id: tx.id,
      timestamp: tx.timestamp,
      action: tx.type.toUpperCase(),
      token: tx.token,
      amount: tx.amount,
      value: tx.amount, // Using amount as the value
      transactionLink: tx.transactionLink,
      status: tx.status
    }));

    console.log(`[API] Transformed transactions for UI:`, uiTransactions);
    return NextResponse.json({ data: uiTransactions });
  } catch (error) {
    console.error('[Route] Transactions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
