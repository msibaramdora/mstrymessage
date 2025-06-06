import dbConnect from '@/lib/dbConnect'
import UserModel from '@/model/User'
import { z } from 'zod'

// Define a schema for request body validation
const VerifyCodePayloadSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  code: z.string().length(6, { message: 'Verification code must be 6 digits' }),
})

export async function POST(request: Request) {
  // db connection
  await dbConnect()

  // get user from request body
  try {
    const requestBody = await request.json()
    const validationResult = VerifyCodePayloadSchema.safeParse(requestBody)

    if (!validationResult.success) {
      // You can choose to send back the first error or all errors
      const firstError =
        validationResult.error.errors[0]?.message || 'Invalid input.'
      return Response.json(
        {
          success: false,
          message: firstError,
          // errors: errors // Optionally send all errors
        },
        { status: 400 }
      )
    }

    const { username, code } = validationResult.data

    const decodedUsername = decodeURIComponent(username)
    console.log(username, code, decodedUsername)
    const user = await UserModel.findOne({ username: decodedUsername }) // Corrected field name from usernamee

    if (!user) {
      return Response.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      )
    }

    // Check if user is already verified
    if (user.isVerified) {
      return Response.json(
        { success: true, message: 'Account already verified.' },
        { status: 200 }
      )
    }

    const isCodeValid = user.verifyCode === code
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()
    // Check if the verification code is valid and not expired
    if (!isCodeValid) {
      return Response.json(
        { success: false, message: 'Incorrect verification code.' },
        { status: 400 }
      )
    }

    if (!isCodeNotExpired) {
      // Optionally, you might want to clear the expired code here
      // user.verifyCode = undefined;
      // user.verifyCodeExpiry = undefined;
      // await user.save();
      return Response.json(
        {
          success: false,
          message:
            'Verification code has expired. Please sign up again to get a new code.',
        },
        { status: 400 }
      )
    }

    // If code is valid and not expired
    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true
      // Optionally clear verification code fields after successful verification
      // user.verifyCode = undefined;
      // user.verifyCodeExpiry = undefined;
      await user.save()

      return Response.json(
        { success: true, message: 'Account verified successfully.' },
        { status: 200 }
      )
    }
  } catch (error) {
    // Log the error and return a 500 response
    console.error('Error verifying user', error)
    return Response.json(
      {
        success: false,
        message: 'Error verifying user.',
      },
      {
        status: 500,
      }
    )
  }
}
