import prisma from '@/lib/db/prisma'
import {
  createNoteSchema,
  deleteNoteSchema,
  updateNoteSchema,
} from '@/lib/validation/note'
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

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = updateNoteSchema.safeParse(body)

    if (!validation.success) {
      console.error(validation.error)
      return NextResponse.json({ error: 'Invalid Input' }, { status: 400 })
    }

    const { id, title, content } = body

    const note = await prisma.note.findUnique({ where: { id } })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const { userId } = auth()
    if (!userId || userId !== note.userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        title,
        content,
      },
    })

    return NextResponse.json({ updatedNote }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = deleteNoteSchema.safeParse(body)

    if (!validation.success) {
      console.error(validation.error)
      return NextResponse.json({ error: 'Invalid Input' }, { status: 400 })
    }

    const { id } = body

    const note = await prisma.note.findUnique({ where: { id } })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const { userId } = auth()
    if (!userId || userId !== note.userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    await prisma.note.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Message Deleted' }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
