import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/dbConnect'
import UserModel from '@/model/User'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email/Username', type: 'text' }, // Changed to identifier
        password: { label: 'Password', type: 'password' }, // Corrected 'labael' to 'label'
      },
      async authorize(credential: any): Promise<any> {
        await dbConnect()
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credential.identifier },
              { username: credential.identifier },
            ],
          })
          if (!user) {
            throw new Error('No user found with this email')
          }

          if (!user.isVerified) {
            throw new Error('Please verify your account before login') // Corrected typo
          }
          const isPasswordCorrect = await bcrypt.compare(
            // Corrected typo
            credential.password,
            user.password
          )
          if (isPasswordCorrect) {
            return user
          } else {
            throw new Error('Incorrect Password')
          }
        } catch (error: any) {
          throw new Error(error)
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id as string
        session.user.isVerified = token.isVerified as string // Assuming isVerified is boolean
        session.user.isAcceptingMessages = token.isAcceptingMessages as boolean
        session.user.username = token.username as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString()
        token.isVerified = user.isVerified
        token.isAcceptingMessages = user.isAcceptingMessages
        token.username = user.username
      }
      return token
    },
  },
  pages: {
    signIn: '/sign-in',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
