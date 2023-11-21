'use client'

import AddEditNoteDialog from '@/components/AddEditNoteDialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Note as NoteModel } from '@prisma/client'
import { useState } from 'react'

interface NoteProps {
  note: NoteModel
}

function Note({ note }: NoteProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)

  const wasUpdated = note.updatedAt > note.createdAt

  const createdUpdatedTimestamp = (
    wasUpdated ? note.updatedAt : note.createdAt
  ).toDateString()

  return (
    <>
      <Card
        className="cursor-pointer transition-shadow hover:shadow-lg"
        onClick={() => setShowEditDialog(true)}
      >
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
      <AddEditNoteDialog
        open={showEditDialog}
        setOpen={setShowEditDialog}
        noteToEdit={note}
      />
    </>
  )
}

export default Note
