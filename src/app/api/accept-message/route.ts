import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/dbConnect'
import { authOptions } from '../auth/[...nextauth]/option'
import UserModel from '@/model/User'

export async function POST(request: Request) {
  // db connection
  await dbConnect()

  // get session
  const session = await getServerSession(authOptions)
  // get user from session
  const user = session?.user

  if (!user || !session.user) {
    return Response.json(
      {
        success: false,
        message: 'No authenticated',
      },
      {
        status: 401,
      }
    )
  }
  // get user id
  const userId = user._id

  // get acceptMessage from request body
  const { acceptMessage } = await request.json()

    console.log(acceptMessage)
  // Validate acceptMessage
  if (
    typeof acceptMessage !== 'boolean' ||
    acceptMessage === null ||
    acceptMessage === undefined
  ) {
    console.log(acceptMessage)
    return Response.json(
      {
        success: false,
        message: 'Invalid value for acceptMessage. It should be a boolean.',
      },
      {
        status: 400,
      }
    )
  }

  // Update user's isAcceptingMessage field
  try {
    const updateUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessage },
      { new: true }
    )

    // If the user is not found, return an error
    if (!updateUser) {
      return Response.json(
        {
          success: false,
          message: 'Unable to find user to update message acceptance status',
        },
        {
          status: 400,
        }
      )
    }

    // If the update is successful, return the updated user
    return Response.json({
      success: true,
      isAcceptingMessages: updateUser.isAcceptingMessage,
    })
  } catch (error) {
    console.error('Error updating message acceptance status:', error)
    return Response.json(
      {
        success: false,
        message: 'Error updating acceptance status',
      },
      {
        status: 500,
      }
    )
  }
}

export async function GET(request: Request) {
  // db connection
  await dbConnect()
  // get session
  const session = await getServerSession(authOptions)

  const user = session?.user

  // Check if user is authenticated
  if (!user || !session.user) {
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
    // Find the user by ID
    const findUser = await UserModel.findById(user._id)

    // If the user is not found, return an error
    if (!findUser) {
      return Response.json(
        {
          success: false,
          message: 'User not found',
        },
        {
          status: 400,
        }
      )
    }

    // Return the user's message acceptance status
    return Response.json(
      {
        success: true,
        isAcceptingMessage: findUser.isAcceptingMessage,
      },
      {
        status: 200,
      }
    )
  } catch (error) {
    console.log('Error retrieving message acceptance status: ', error)
    return Response.json(
      {
        success: false,
        message: 'Error retrieving message acceptance status',
      },
      {
        status: 500,
      }
    )
  }
}
