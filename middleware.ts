import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_KEY = process.env.DEBUG_API_KEY || 'your-debug-api-key'; // Set this in .env.local

export function middleware(request: NextRequest) {
  // Only protect /api/ routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== API_KEY) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }
  return NextResponse.next();
}

// Only run middleware on /api/* routes
export const config = {
  matcher: ['/api/:path*'],
};
