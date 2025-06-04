import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    _id?: stinrg
    isVerified?: string
    isAcceptingMessages?: boolean
    username?: string
  }
  interface Session {
    user: {
      _id?: stinrg
      isVerified?: string
      isAcceptingMessages?: boolean
      username?: string
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    _id?: stinrg
    isVerified?: string
    isAcceptingMessages?: boolean
  }
}
