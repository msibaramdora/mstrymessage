import dbConnect from '@/lib/dbConnect'
import { authOptions } from '../../auth/[...nextauth]/option'
import UserModel from '@/model/User'
import { Message } from '@/model/User'
import { getServerSession } from 'next-auth'

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: { messageid: string }
  }
) {
  //dbConnect
  await dbConnect()

  const messageId = (await params).messageid

  const session = await getServerSession(authOptions)

  const user = session?.user

  //Check user authenticated or not
  if (!user || session) {
    return Response.json(
      {
        success: false,
        message: 'User not authenticated',
      },
      {
        status: 401,
      }
    )
  }
  try {
    //Delete the message
    const updateResult = await UserModel.updateOne(
      { _id: user?._id },
      { $pull: { messages: { _id: messageId } } }
    )

    if (updateResult.modifiedCount === 0) {
      return Response.json(
        { message: 'Message not found or already deleted', success: false },
        { status: 404 }
      )
    }

    return Response.json(
      {
        success: true,
        message: 'Message deleted successfully',
      },
      {
        status: 200,
      }
    )
  } catch (error) {
    console.log('Message delete error', error)
  }
}
