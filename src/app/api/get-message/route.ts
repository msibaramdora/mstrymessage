import dbConnect from '@/lib/dbConnect'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/option'
import mongoose from 'mongoose'
import UserModel from '@/model/User'


// This route handles fetching messages for the authenticated user
export async function GET(request: Request) {
  // Connect to the database
  await dbConnect()

  // Get the session to check if the user is authenticated
  const session = await getServerSession(authOptions)
  // Check if the user is authenticated
  const user_ = session?.user

  // If the user is not authenticated, return a 401 Unauthorized response
  if (!user_) {
    return Response.json(
      {
        success: false,
        message: 'User not authenticated',
      },
      { status: 401 }
    )
  }

  const userId = new mongoose.Types.ObjectId(user_._id)

  try {
    // Use aggregation to fetch the user's messages sorted by createdAt in descending order
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$messages' },
      { $sort: { 'messages.createdAt': -1 } },
      { $group: { _id: '$_id', messages: { $push: '$messages' } } },
    ]).exec()

    if (!user) {
      return Response.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      )
    }

    // Check if the user has any messages
    if (user.length === 0 || user[0].messages.length === 0) {
      return Response.json(
        {
          success: false,
          message: 'No messages found for the user',
        },
        { status: 404 }
      )
    }

    // Return the user's messages
    return Response.json(
      {
        success: true,
        messages: user[0].messages,
      },
      {
        status: 200,
      }
    )
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: 'An unexpected error occurred while fetching messages',
      },
      { status: 500 }
    )
  }
}
