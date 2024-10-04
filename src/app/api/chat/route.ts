import { getNotesIndex } from '@/lib/db/pinecone'
import prisma from '@/lib/db/prisma'
import { getEmbedding } from '@/lib/openai'
import { auth } from '@clerk/nextjs'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'

// export const runtime = 'edge'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: Request) {
  try {
    // Extract the `messages` from the body of the request
    const body = await req.json()
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = body.messages

    console.log('messages', messages)

    const notesIndex = await getNotesIndex()

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

    const systemMessage: OpenAI.Chat.ChatCompletionMessageParam = {
      role: 'assistant',
      content:
        'You are an AI assistant that generates SQL queries based on user requests' +
        'Provide only the SQL statement.' +
        'Ensure the SQL query is correct and follows best practices.' +
        'Use standard PostgreSQL syntax.' +
        'Do not include any explanatory text or additional commentary.' +
        'Do not make any assumptions about the schema beyond what is provided.' +
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
      model: 'gpt-4o-mini',
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
