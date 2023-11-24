// app/api/chat/route.ts

import { notesIndex } from '@/lib/db/pinecone'
import prisma from '@/lib/db/prisma'
import { getEmbedding } from '@/lib/openai'
import { auth } from '@clerk/nextjs'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { ChatCompletionMessage } from 'openai/resources/index.mjs'

// export const runtime = 'edge'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: Request) {
  try {
    // Extract the `messages` from the body of the request
    const body = await req.json()
    const messages: ChatCompletionMessage[] = body.messages

    // I just want to send the last 6 messages to save token and narrow down
    // the search of recent topic that we chat about.
    const messagesTruncated = messages.slice(-6)

    console.log('messagesTruncated', messagesTruncated)

    // search for the relevant noteIndex
    const embedding = await getEmbedding(
      messagesTruncated.map((message) => message.content).join('\n'),
    )

    console.log('embedding', embedding)

    const { userId } = auth()
    const vectorQueryResponse = await notesIndex.query({
      vector: embedding,
      topK: 4,
      filter: { userId },
    })

    console.log('vectorQueryResponse', vectorQueryResponse)
    // vectorQueryResponse create an array of mongoId and find all notes in mongodb
    // the pinecone ID has the mongo-DB ID note
    const relevantNotes = await prisma.note.findMany({
      where: {
        id: {
          in: vectorQueryResponse.matches.map((match) => match.id),
        },
      },
    })

    console.log('relevantNotes', relevantNotes)

    const systemMessage: ChatCompletionMessage = {
      role: 'assistant',
      content:
        "You are an intelligent and smart note-taking-app. You answer user's question based on their existing notes." +
        'Also you can give your opinion, skills and knowledge relevant notes' +
        'The relevant notes for this query are: \n' +
        relevantNotes
          .map((note) => `Title: ${note.title}\nContent:\n${note.content}`)
          .join('\n\n'),
    }

    // relevantNote
    // Title: "title"
    //
    // Content:
    // "Content value"

    // Request the OpenAI API for the response based on the prompt
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [systemMessage, ...messagesTruncated],
    })

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response)

    // Respond with the stream
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
