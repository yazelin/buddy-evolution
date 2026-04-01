import { NextResponse } from 'next/server'
import { ACHIEVEMENTS } from '@/lib/achievements'

export async function GET() {
  return NextResponse.json(ACHIEVEMENTS)
}
