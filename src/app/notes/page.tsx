import Note from '@/components/Note'
import prisma from '@/lib/db/prisma'
import { auth } from '@clerk/nextjs'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'David - Notes',
}

export default async function NotePage() {
  const { userId }: { userId: string | null } = auth()

  if (!userId) redirect('/sign-in')

  const allNotes = await prisma.note.findMany({ where: { userId } })
  console.log('allNotes', allNotes)

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {allNotes.map((note) => (
        <Note note={note} key={note.id} />
      ))}
      {allNotes.length === 0 && (
        <div className="col-span-full text-center">
          {"You don't have any notes yet."}
        </div>
      )}
    </div>
  )
}
