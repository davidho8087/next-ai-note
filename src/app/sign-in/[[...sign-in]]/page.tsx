import {Metadata} from "next";

export const metadata: Metadata = {
    title: "David - Sign-in"
}

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <SignIn appearance={{ variables: { colorPrimary: '#0F172A' } }} />
    </div>
  )
}
