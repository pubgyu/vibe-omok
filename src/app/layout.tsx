import type { Metadata } from 'next'
import { Providers } from './providers'
import '../styles/main.scss'

export const metadata: Metadata = {
  title: 'Omok AI',
  description: 'Google 로그인 후 즐기는 오목 게임',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
