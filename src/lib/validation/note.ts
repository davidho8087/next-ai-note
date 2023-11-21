import { z } from 'zod'

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
})

export type CreateNoteSchema = z.infer<typeof createNoteSchema>
