import dbConnect from '@/lib/dbConnect'
import UserModel from '@/model/User'
import bcrypt from 'bcryptjs'

import { sendVerificationEmail } from '@/helpers/sendVerificationEmail'

export async function POST(request: Request) {
  await dbConnect()

  try {
    const { username, email, password } = await request.json()
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    })

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: 'Username is already taken',
        },
        { status: 400 }
      )
    }

    const existingUserByEmail = await UserModel.findOne({ email })

    const verifyCode = Math.floor(10000 + Math.random() * 900000).toString()

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: 'User already esit with this email',
          },
          { status: 400 }
        )
      } else {
        const hasedPassword = await bcrypt.hash(password, 10)
        existingUserByEmail.password = hasedPassword
        existingUserByEmail.verifyCode = verifyCode
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
        await existingUserByEmail.save()
      }
    } else {
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

      await newUser.save()
    }

    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    )

    console.log(emailResponse)

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      )
    }

    return Response.json(
      {
        success: true,
        message: 'User register successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error register user', error)
    return Response.json(
      {
        success: false,
        message: 'Error requistering user',
      },
      {
        status: 500,
      }
    )
  }
}
