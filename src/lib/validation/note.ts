import { z } from 'zod'

export const createNoteSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
})

export type CreateNoteSchema = z.infer<typeof createNoteSchema>
