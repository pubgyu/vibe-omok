import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import GameApp from '@/App'
import { authOptions } from '../api/auth/[...nextauth]/options'

export default async function GamePage() {
  const session = await getServerSession(authOptions as any)
  if (!session) {
    redirect('/')
  }

  return <GameApp />
}
