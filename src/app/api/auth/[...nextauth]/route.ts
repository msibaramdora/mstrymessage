import NextAuth from 'next-auth'
import { anthOtions } from './option'

const handler = NextAuth(anthOtions)

export { handler as GET, handler as POST }
