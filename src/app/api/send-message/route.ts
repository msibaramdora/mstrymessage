import dbConnect from '@/lib/dbConnect'
import UserModel from '@/model/User'
import { authOptions } from '../auth/[...nextauth]/option'
import { Message } from '@/model/User'
import { getServerSession } from 'next-auth'

export async function POST(request: Request) {
  //dbConnect
  dbConnect()
  const { username, content } = await request.json()

  try {
    const user = await UserModel.findOne({ username }).exec()

    if (!user) {
      return Response.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      )
    }

    //Check if user is message excpeted
    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          message: 'User not expted message',
        },
        { status: 403 }
      )
    }

    const message = { content, createdAt: new Date() }

    //Push the new message in the user message array
    user.messages.push(message as Message)

    await user.save()

    return Response.json(
      {
        success: true,
        message: 'Message sent successfully',
      },
      {
        status: 200,
      }
    )
  } catch (error) {
    console.error(error)
    return Response.json(
      {
        success: false,
        message: 'Internal server error',
      },
      {
        status: 500,
      }
    )
  }
}
