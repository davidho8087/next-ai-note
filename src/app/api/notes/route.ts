import prisma from '@/lib/db/prisma'
import { createNoteSchema } from '@/lib/validation/note'
import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = createNoteSchema.safeParse(body)

    if (!validation.success) {
      console.error(validation.error)
      return NextResponse.json({ error: 'Invalid Input' }, { status: 400 })
    }

    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const note = await prisma.note.create({
      data: {
        title: body.title,
        content: body.content,
        userId,
      },
    })

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
