// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: 'Hello World' });
}

// Optional: stub for POST
export async function POST(req: NextRequest) {
  return NextResponse.json({ message: 'Not implemented' });
}