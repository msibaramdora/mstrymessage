import { Html, Button } from '@react-email/components'

interface VerificationEmailProps {
  username: string
  otp: string
}

export const VerificationEmail = ({
  username,
  otp,
}: VerificationEmailProps) => {
  return (
    <Html lang="en" dir="ltr">
      <h1>{username}</h1>
      <div>{otp}</div>
      <Button href="https://example.com" style={{ color: '#61dafb' }}>
        Click me
      </Button>
    </Html>
  )
}
