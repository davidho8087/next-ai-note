import { getNotesIndex } from '@/lib/db/pinecone'
import prisma from '@/lib/db/prisma'
import { getEmbedding } from '@/lib/openai'
import { handleConversation } from '@/server-actions/detectIntent'
import { auth } from '@clerk/nextjs'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: Request) {
  try {
    // Extract the `messages` from the body of the request
    const body = await req.json()
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = body.messages

    const notesIndex = await getNotesIndex()

    // Narrow down the conversation to the last 6 messages
    const messagesTruncated = messages.slice(-6)

    // Get the latest user message
    const latestUserMessage = messagesTruncated
      .slice()
      .reverse()
      .find((msg) => msg.role === 'user')

    const messagesForIntent = latestUserMessage ? [latestUserMessage] : []

    console.log('Latest user message:', messagesForIntent)

    // Step 1: Detect the user's intent and map to metadata
    const conversationResult = await handleConversation(messagesForIntent)
    console.log('Conversation Result:', conversationResult)

    // Extract the category directly from the result
    const category = conversationResult || undefined // No need for `metadata` property access
    console.log('Mapped Metadata Category:', category)

    // Ensure category is correctly passed in the filter
    if (!category) {
      console.error('Category is missing, cannot filter by metadata.')
      return NextResponse.json(
        { error: 'Category is missing in the metadata.' },
        { status: 400 },
      )
    }

    // Get the embedding for the vector search
    const embedding = await getEmbedding(
      messagesTruncated.map((message) => message.content).join('\n'),
    )

    // Get the authenticated userId
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated.' },
        { status: 401 },
      )
    }

    // Query the Pinecone index with the embedding and filter by userId and category
    const vectorQueryResponse = await notesIndex.query({
      vector: embedding,
      topK: 4,
      filter: {
        $and: [
          { userId: { $eq: userId } }, // Ensure the userId matches
          { category: { $eq: category } }, // Ensure the category matches
        ],
      },
      includeMetadata: true, // Include metadata in the result to verify it
    })

    console.log('vectorQueryResponse', vectorQueryResponse)

    if (
      !vectorQueryResponse.matches ||
      vectorQueryResponse.matches.length === 0
    ) {
      console.error('No matches found in Pinecone.')
      return NextResponse.json(
        { error: 'No relevant notes found for the query.' },
        { status: 400 },
      )
    }

    // Get relevant notes from the database using the ids returned from Pinecone
    const relevantNotes = await prisma.note.findMany({
      where: {
        id: {
          in: vectorQueryResponse.matches.map((match) => match.id),
        },
      },
    })

    console.log('relevantNotes', relevantNotes)
    if (relevantNotes.length === 0) {
      return NextResponse.json(
        { error: 'No relevant notes found to generate the SQL query.' },
        { status: 400 },
      )
    }

    // Construct the system message for generating the SQL query
    const systemMessage: OpenAI.Chat.ChatCompletionMessageParam = {
      role: 'assistant',
      content:
        'You are an AI assistant that generates SQL queries based on user requests. ' +
        'Provide only the SQL statement. ' +
        'Ensure the SQL query is correct and follows best practices. ' +
        'Use standard PostgreSQL syntax. ' +
        'Do not include any explanatory text or additional commentary. ' +
        'The relevant notes for this query are: \n' +
        'After providing the SQL query, provide a brief conclusion or summary of what the query does in one or two sentences.' +
        messagesTruncated
          .filter((msg) => msg.role === 'user')
          .map((msg) => msg.content)
          .join('\n') +
        '\nThe relevant notes for this query are:\n' +
        relevantNotes
          .map(
            (note) =>
              `Title: ${note.title}\nSubTitle: ${note.subTitle}\nContent:\n${note.content}`,
          )
          .join('\n\n'),
    }

    // Prepare the messages for the assistant
    const assistantMessages = [systemMessage]

    // Request the OpenAI API for the response based on the prompt
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      stream: true,
      messages: assistantMessages,
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
