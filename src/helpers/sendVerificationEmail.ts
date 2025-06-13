// filepath: /workspaces/mstrymessage/src/helpers/sendVerificationEmail.ts
import nodemailer from 'nodemailer'

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // Use 465 for SSL or 587 for TLS
    secure: true, // true for 465, false for 587
    auth: {
      user: process.env.GOOGLE_USER,
      pass: process.env.GOOGLE_PASS,
    },
  })

  try {
    const htmlOutput = `
      <html>
        <body>
          <h1>Hello ${username},</h1>
          <p>Your verification code is: <strong>${verifyCode}</strong></p>
          <p>Please use this code to verify your account.</p>
        </body>
      </html>
    `

    await transporter.sendMail({
      from: '"Maddison Foo Koch" <msibaramdora2005@gmail.com>',
      to: email,
      subject: 'Mystry message | Verification code',
      html: htmlOutput,
    })

    console.log('Verification email sent successfully to:', email)
    console.log(username, 'with code:', verifyCode)
    return { success: true, message: 'Verification email sent successfully' }
  } catch (emailError) {
    console.error('Error sending verification email', emailError)
    return { success: false, message: 'Failed to send verification email' }
  }
}
