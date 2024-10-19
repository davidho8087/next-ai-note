import { getNotesIndex } from '@/lib/db/pinecone'
import prisma from '@/lib/db/prisma'
import { getEmbedding } from '@/lib/openai'
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
    console.log('body', body)
    const validation = createNoteSchema.safeParse(body)
    // return true

    // // Get the Pinecone index (ensure the index exists or create it if not)
    const notesIndex = await getNotesIndex()

    if (!validation.success) {
      console.error(validation.error)
      return NextResponse.json({ error: 'Invalid Input' }, { status: 400 })
    }

    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const embedding = await getEmbeddingForNotes(
      body.title,
      body.subTitle,
      body.content,
    )

    // Transaction
    const noteResult = await prisma.$transaction(async (tx) => {
      const note = await tx.note.create({
        data: {
          title: body.title,
          subTitle: body.subTitle,
          content: body.content,
          metadata: body.metadata,
          userId,
        },
      })

      console.log('userId onCreate', userId)

      console.log('metadata onCreate', body.metadata)

      const fetchResult = await notesIndex.fetch(['67062a97e86c48580892ae00'])

      console.log('fetchResult', fetchResult)

      await notesIndex.upsert([
        {
          id: note.id,
          values: embedding,
          metadata: { user: userId, category: body.metadata },
        },
      ])
      return note
    })

    return NextResponse.json({ noteResult }, { status: 201 })
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
    const notesIndex = await getNotesIndex()

    if (!validation.success) {
      console.error(validation.error)
      return NextResponse.json({ error: 'Invalid Input' }, { status: 400 })
    }

    const { id, title, subTitle, content, metadata } = body

    const note = await prisma.note.findUnique({ where: { id } })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const { userId } = auth()
    if (!userId || userId !== note.userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const embedding = await getEmbeddingForNotes(title, subTitle, content)

    // Transaction
    const updatedNoteResult = await prisma.$transaction(async (tx) => {
      const updatedNote = await prisma.note.update({
        where: { id },
        data: {
          title,
          subTitle,
          content,
          metadata,
        },
      })

      console.log('metadata onUpdate', metadata)

      await notesIndex.upsert([
        {
          id,
          values: embedding,
          metadata: { userId, category: metadata },
        },
      ])
      return updatedNote
    })

    return NextResponse.json({ updatedNoteResult }, { status: 200 })
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
    const notesIndex = await getNotesIndex()

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

    // const embedding = await getEmbeddingForNotes(body.title, body.content)

    // Transaction
    await prisma.$transaction(async (tx) => {
      await prisma.note.delete({ where: { id } })
      await notesIndex.deleteOne(id)
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

async function getEmbeddingForNotes(
  title: string,
  subTitle: string | undefined,
  content: string | undefined,
) {
  return getEmbedding(title + '\n\n' + (content ?? ''))
}
