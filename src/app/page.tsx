import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from './api/auth/[...nextauth]/options'
import { LoginCard } from '../components/auth/LoginCard'

export default async function HomePage() {
  const session = await getServerSession(authOptions as any)
  if (session) {
    redirect('/game')
  }

  return <LoginCard />
}
