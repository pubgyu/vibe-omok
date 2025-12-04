import { NextResponse } from 'next/server'

const OPENAI_MODEL = 'gpt-4.1'

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY missing' }, { status: 500 })
  }

  try {
    const { board, boardSize, currentPlayer } = await request.json()

    const prompt = [
      {
        role: 'system',
        content:
          'You are an Omok (Gomoku) assistant. Follow priority strictly: (1) win immediately; (2) block opponent win; (3) create or block open-four/open-three; (4) extend strongest line near center. Respond ONLY with JSON: {"moves":[{"index":number,"reason":string}, ...]} sorted best-first, max 3 items. No extra text.',
      },
      {
        role: 'user',
        content: JSON.stringify({ board, boardSize, currentPlayer }),
      },
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: prompt,
        max_tokens: 64,
        temperature: 0.2,
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      return NextResponse.json({ error: 'AI 호출 실패', detail }, { status: 502 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    let parsed: any = {}
    try {
      parsed = JSON.parse(content || '{}')
    } catch {
      parsed = {}
    }

    return NextResponse.json(parsed)
  } catch (error) {
    return NextResponse.json({ error: '서버 오류', detail: String(error) }, { status: 500 })
  }
}
