// This file handles the user registration process.

import dbConnect from '@/lib/dbConnect'
import UserModel from '@/model/User'
import bcrypt from 'bcryptjs'

import { sendVerificationEmail } from '@/helpers/sendVerificationEmail'

export async function POST(request: Request) {
  // db connection
  await dbConnect()

  // get user from request body
  try {
    const { username, email, password } = await request.json()
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
    })

    // Validate username
    if (
      existingUserVerifiedByUsername &&
      existingUserVerifiedByUsername.isVerified
    ) {
      return Response.json(
        {
          success: false,
          message: 'Username is already taken',
        },
        { status: 400 }
      )
    } else {
      // If user exists but not verified, delete the user
      await UserModel.findByIdAndDelete(existingUserVerifiedByUsername?._id)
    }
    // Validate email
    const existingUserByEmail = await UserModel.findOne({ email })

    const verifyCode = Math.floor(10000 + Math.random() * 900000).toString()
    // Validate password
    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: 'User already exists with this email',
          },
          { status: 400 }
        )
      } else {
        // If user exists but not verified, update password and verify code
        const hasedPassword = await bcrypt.hash(password, 10)
        existingUserByEmail.password = hasedPassword
        existingUserByEmail.verifyCode = verifyCode
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
        await existingUserByEmail.save()
      }
    } else {
      // If user does not exist, create a new user
      const hasedPassword = await bcrypt.hash(password, 10)
      const expiryDate = new Date()

      expiryDate.setHours(expiryDate.getHours() + 1)

      const newUser = new UserModel({
        username,
        email,
        password: hasedPassword,
        verifyCode: verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      })

      // Save the new user to the database
      await newUser.save()
    }

    // Send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    )

    // If email sending fails, return an error
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      )
    }

    // If everything is successful, return the status code
    // and a success message
    return Response.json(
      {
        success: true,
        message: 'User registered successfully. Please verify your account.',
      },
      { status: 200 }
    )
  } catch (error) {
    // Log the error and return a 500 response
    return Response.json(
      {
        success: false,
        message: 'Error registering user',
      },
      {
        status: 500,
      }
    )
  }
}
