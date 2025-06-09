import UserModel from "@/model/User"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/option"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"

export async function POST(request: Request) {
  //dbConnect
  dbConnect()

  const session = await getServerSession(authOptions)

  // 1. Authentication Check: Ensure user is logged in
  // if (!session || !session.user || !session.user._id) { // Assuming _id is available on session.user
  //   return Response.json(
  //     {
  //       success: false,
  //       message: "User not authenticated",
  //     },
  //     {
  //       status: 401, // Unauthorized
  //     }
  //   );
  // }

  const { password, newPassword } = await request.json()

  // 2. Input Validation
  if (!password || !newPassword) {
    return Response.json(
      {
        success: false,
        message: "Current password and new password are required.",
      },
      {
        status: 400, // Bad Request
      }
    )
  }

  // if (newPassword.length < 8) { // Example: Minimum length for new password
  //   return Response.json(
  //     {
  //       success: false,
  //       message: "New password must be at least 8 characters long.",
  //     },
  //     {
  //       status: 400, // Bad Request
  //     }
  //   );
  // }

  try {
    // Use the authenticated user's ID from the session
    // const userId = session.user._id;

    const currentUser = await UserModel.findById("68468cf315836abf7555591e")

    if (!currentUser) {
      // This case should ideally not happen if session exists, but good to have as a safeguard
      return Response.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404, // Not Found, or 401 if you consider it an authentication failure
        }
      )
    }

    // 3. Compare Current Password
    const compairePassword = await bcrypt.compare(
      password,
      currentUser.password // Use the hashed password from the database
    )

    if (!compairePassword) {
      return Response.json(
        {
          success: false,
          message: "Incorrect current password.",
        },
        {
          status: 401, // Unauthorized
        }
      )
    }

    // 4. Hash New Password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 5. Update User's Password
    currentUser.password = hashedPassword // Assign the HASHED new password

    await currentUser.save()

    // 6. Success Response
    return Response.json(
      {
        success: true,
        message: "Password changed successfully.",
      },
      {
        status: 200, // OK
      }
    )
  } catch (error) {
    console.error("Error changing password:", error) // Use console.error for errors
    return Response.json(
      {
        success: false,
        message: "Server error occurred while changing password.",
      },
      {
        status: 500, // Internal Server Error
      }
    )
  }
}
