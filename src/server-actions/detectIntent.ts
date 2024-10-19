import { intents } from '@/lib/mock/metaData'
import { OpenAI } from 'openai'

// Initialize OpenAI API
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

// Function to detect the user's intent based on conversation messages
export async function detectIntent(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
) {
  // System message instructing the model what to do
  const systemMessage: OpenAI.Chat.ChatCompletionMessageParam = {
    role: 'system',
    content: `
      You are an AI assistant. Analyze the following conversation and determine the most appropriate intent from the following list:
      - question related to general information of outlet and premises
      - question related to details of Server information, PC information and devices
      - question related to CPU, GPU, Memory, and Hard-disk details
      - querying for nothing.
      - question related to video analytics and customer traffic analysis
      - question related to details of store footfall tracking and people counting
      - question about entry and exit data of stores

      Return only the name of the intent that best matches the conversation.
    `,
  }

  // Combine system message with user messages
  const fullMessages = [systemMessage, ...messages]

  // Call OpenAI API to detect intent
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: fullMessages, // Send the conversation messages to the API
    max_tokens: 50, // Limit token usage
  })

  // Extract detected intent from response
  const detectedIntent = response.choices[0]?.message?.content?.trim()

  return detectedIntent
}

// Function to map detected intent to its corresponding metadata (category)
export function mapIntentToMetadata(detectedIntent: string | null) {
  console.log('Detected Intent:', detectedIntent)

  // Match the detected intent to the intents array, ensuring case and space insensitivity
  const intent = intents.find(
    (i) => i.name.toLowerCase().trim() === detectedIntent?.toLowerCase().trim(),
  )

  console.log('Mapped Intent:', intent)

  if (!intent) {
    return ''
  }

  return intent.category // Return the category (metadata)
}

// Example function to detect intent and map to metadata
export async function handleConversation(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
) {
  // Detect the user's intent
  const detectedIntent = await detectIntent(messages)

  console.log('Detected Intent:', detectedIntent)

  // Map the detected intent to the corresponding metadata
  const category = mapIntentToMetadata(detectedIntent ?? null)

  console.log('Mapped Category:', category)

  // Return the detected category
  return category
}
