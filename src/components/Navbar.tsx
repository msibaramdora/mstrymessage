'use client'

import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from './ui/button'

function Navbar() {
  const { data: session } = useSession()
  const user = session?.user

  return (
    <nav className="p-4 mb-[1px] md:p-6 shadow-md bg-gray-900 text-white">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <Link href="/" className="text-xl font-bold mb-4 md:mb-0">
          True Feedback
        </Link>
        {session ? (
          <>
            <span className="mr-4">
              Welcome, {user?.username || user?.email}
            </span>
            <Button
              onClick={() => signOut()}
              className="w-full md:w-auto bg-slate-100 text-black cursor-pointer"
              variant="outline"
            >
              Logout
            </Button>
          </>
        ) : (
          <div className="flex gap-5">
            <Link href="/sign-in">
              <Button
                className="w-full md:w-auto bg-slate-100 text-black cursor-pointer"
                variant={'outline'}
              >
                Login
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                className="w-full md:w-auto bg-slate-100 text-black cursor-pointer"
                variant={'outline'}
              >
                Sign-up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
