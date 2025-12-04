"use client"

import { signIn } from 'next-auth/react'

export const LoginCard = () => (
  <main className="login-shell">
    <div className="login-card">
      <p className="eyebrow">Google OAuth</p>
      <h1>로그인 후 오목을 시작하세요</h1>
      <p className="lede">로그인하면 AI와 함께 오목 게임을 즐길 수 있습니다.</p>
      <button type="button" className="primary" onClick={() => signIn('google')}>
        구글로 로그인
      </button>
    </div>
  </main>
)
