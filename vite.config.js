import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

// Ensure local env (.env.local) is loaded for dev/preview middleware
dotenv.config({ path: '.env.local' })

// 난이도 상향을 위해 기본 모델을 gpt-4.1로 설정합니다.
const OPENAI_MODEL = 'gpt-4.1'

const attachAiRoute = (server) => {
  server.middlewares.use('/api/omok-ai/health', async (req, res, next) => {
    if (req.method !== 'GET') return next()
    const apiKey = process.env.OPENAI_API_KEY
    const ok = Boolean(apiKey)
    res.writeHead(ok ? 200 : 500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok, message: ok ? 'OK' : 'OPENAI_API_KEY missing' }))
  })

  server.middlewares.use('/api/omok-ai', async (req, res, next) => {
    if (req.method !== 'POST') return next()
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'OPENAI_API_KEY가 설정되지 않았습니다.' }))
        return
      }

      try {
        let body = ''
        for await (const chunk of req) {
          body += chunk
        }
        const payload = JSON.parse(body || '{}')
        const { board, boardSize, currentPlayer } = payload

        const prompt = [
          {
            role: 'system',
            content:
              'You are an Omok (Gomoku) assistant. Follow priority strictly: (1) win immediately; (2) block opponent win; (3) create or block open-four/open-three; (4) extend strongest line near center. Respond ONLY with JSON: {"moves":[{"index":number,"reason":string}, ...]} sorted best-first, max 3 items. No extra text.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              board,
              boardSize,
              currentPlayer,
            }),
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
            max_tokens: 32,
            temperature: 0.4,
          }),
        })

        if (!response.ok) {
          const text = await response.text()
          res.writeHead(502, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'AI 호출 실패', detail: text }))
          return
        }

        const data = await response.json()
        const content = data.choices?.[0]?.message?.content?.trim()
        let index = null
        try {
          const parsed = JSON.parse(content || '{}')
          if (typeof parsed.index === 'number') {
            index = parsed.index
          }
        } catch {
          // ignored
        }

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ index }))
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: '서버 오류', detail: String(error) }))
      }
    })
}

const aiPlugin = () => ({
  name: 'omok-ai-endpoint',
  configureServer(server) {
    attachAiRoute(server)
  },
  configurePreviewServer(server) {
    attachAiRoute(server)
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), aiPlugin()],
})
