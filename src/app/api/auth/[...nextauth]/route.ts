import NextAuth from 'next-auth'
import { authOptions } from './options'

const handler = (NextAuth as any)(authOptions)

export { handler as GET, handler as POST }
