import { NextResponse } from 'next/server'

export async function GET() {
  const ok = Boolean(process.env.OPENAI_API_KEY)
  return NextResponse.json(
    { ok, message: ok ? 'OK' : 'OPENAI_API_KEY missing' },
    { status: ok ? 200 : 500 },
  )
}
