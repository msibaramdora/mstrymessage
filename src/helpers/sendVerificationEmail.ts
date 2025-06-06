import { resend } from '@/lib/resend'
import { ApiResponse } from '@/types/ApiResponse'
import { VerificationEmail } from '../../emails/VerificationEmail'

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    console.log(email)
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Mystry message | Verification code',
      react: VerificationEmail({ username, otp: verifyCode }),
    })
    console.log('Verification email sent successfully to:', email)
    console.log(username, 'with code:', verifyCode)
    return { success: true, message: 'Verification email sent successfully' }
  } catch (emailError) {
    console.error('Error sending verification email' + emailError)
    return { success: false, message: 'Failed to send verification email' }
  }
}
