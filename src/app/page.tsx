import { Button } from '@/components/ui/button'
import { auth } from '@clerk/nextjs'
// import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect if logged-in
  const { userId } = auth()
  if (userId) redirect('/notes')

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-5">
      {/*Group*/}
      <div className="flex items-center gap-4">
        {/*<Image src={logo} alt="logo" width={100} height={100} />*/}
        <span className="text-4xl font-extrabold -tracking-tight lg:text-5xl">
          Note Taker
        </span>
      </div>
      <p className="max-w-prose text-center">
        An Intelligent note tracking app with AI, build with Next.js, Pine.come,
        Shad-cn Clerk and more
      </p>
      <Button size="lg" asChild>
        <Link href="/notes">Open</Link>
      </Button>
    </main>
  )
}
