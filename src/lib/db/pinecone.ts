// lib/db/pinecone.ts

import {
  Pinecone,
  type PineconeConfiguration,
} from '@pinecone-database/pinecone'

const config: PineconeConfiguration = {
  apiKey: process.env.PINECONE_API_KEY ?? '',
}

const pc = new Pinecone(config)

export async function getNotesIndex() {
  try {
    const indexName = 'david-note' // Your index name

    // Check if the index exists
    const existingIndexes = await pc.listIndexes()
    if (existingIndexes.indexes) {
      for (const index of existingIndexes.indexes) {
        console.log(`Checking index "${index.name}"...`)
        if (index.name === indexName) {
          console.log(`Index "${indexName}" exists. Returning it.`)
          return pc.index(indexName)
        }
      }
    }

    // If the index doesn't exist, create it
    console.log(`Index "${indexName}" does not exist. Creating it now...`)
    return pc.index(indexName)
  } catch (error) {
    console.error('Error getting or creating notes index:', error)
    throw error
  }
}
