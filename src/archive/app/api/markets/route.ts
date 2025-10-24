import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    const res = await fetch('https://api.reya.xyz/api/markets');
    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Error fetching markets:', error);
    return NextResponse.json([]);
  }
}