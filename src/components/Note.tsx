import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Note as NoteModel } from '@prisma/client'

interface NoteProps {
  note: NoteModel
}

function Note({ note }: NoteProps) {
  const wasUpdated = note.updatedAt > note.createdAt

  const createdUpdatedTimestamp = (
    wasUpdated ? note.updatedAt : note.createdAt
  ).toDateString()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{note.title}</CardTitle>
        <CardDescription>
          {createdUpdatedTimestamp}
          {wasUpdated && ' (updated)'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-line">{note.content}</p>
      </CardContent>
    </Card>
  )
}

export default Note
