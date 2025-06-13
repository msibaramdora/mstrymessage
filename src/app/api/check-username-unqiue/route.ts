import dbConnect from '@/lib/dbConnect'
import UserModel from '@/model/User'
import { z } from 'zod'
import { usernameValidation } from '@/schemas/signUpSchema'

const UsernameQuerySchema = z.object({
  username: usernameValidation,
})

export async function GET(request: Request) {
  // Connect to the database
  await dbConnect()

  try {
    // Extract query parameters from the request URL
    const { searchParams } = new URL(request.url)
    const queryParams = {
      username: searchParams.get('username'),
    }
    // Validate the query parameters using Zod schema
    const result = UsernameQuerySchema.safeParse(queryParams)

    // If validation fails, return an error response
    if (!result.success) {
      const usernameError = result.error.format().username?._errors || []
      return Response.json(
        {
          success: false,
          message:
            usernameError?.length > 0
              ? usernameError.join(', ')
              : 'Invalid query parameters',
        },
        {
          status: 400,
        }
      )
    }

    const { username } = result.data
    //find user by username
    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    })
    // Check if the username is already taken by a verified user
    if (existingVerifiedUser) {
      return Response.json(
        { success: false, message: 'Username is already taken' },
        {
          status: 200,
        }
      )
    }
    // If no user is found, the username is unique
    return Response.json(
      {
        success: true,
        message: 'Username is unique',
      },
      {
        status: 200,
      }
    )
  } catch (error) {
    // Handle any errors that occur during the process

    return Response.json(
      {
        success: false,
        message: 'Error checking username',
      },
      { status: 500 }
    )
  }
}
