import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import UserModel from '@/model/User'
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail'

export async function POST(request: Request) {
  await dbConnect()

  try {
    const { username, email, password } = await request.json()
    const existingUserVerifiedByUsername = await UserModel.findOne({ username })

    console.log('username in 14', username, email, password)

    if (
      existingUserVerifiedByUsername &&
      existingUserVerifiedByUsername.isVerified
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Username is already taken',
        },
        { status: 400 }
      )
    } else {
      await UserModel.findByIdAndDelete(existingUserVerifiedByUsername?._id)
    }

    const existingUserByEmail = await UserModel.findOne({ email })
    const verifyCode = Math.floor(10000 + Math.random() * 900000).toString()

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return NextResponse.json(
          {
            success: false,
            message: 'User already exists with this email',
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

    console.log('newUser', email, username, verifyCode)
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    )

    console.log('emailResponse', emailResponse)
    if (!emailResponse) {
      return NextResponse.json(
        {
          success: false,
          message: 'Error in email sending',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully. Please verify your account.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error registering user', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error registering user',
      },
      { status: 500 }
    )
  }
}
