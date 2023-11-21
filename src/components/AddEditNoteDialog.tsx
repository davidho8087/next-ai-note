'use client'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import LoadingButton from '@/components/ui/loading-button'
import { Textarea } from '@/components/ui/textarea'
import { CreateNoteSchema, createNoteSchema } from '@/lib/validation/note'
import { zodResolver } from '@hookform/resolvers/zod'
import { Note } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface AddEditNoteDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  noteToEdit?: Note
}

function AddEditNoteDialog({
  open,
  setOpen,
  noteToEdit,
}: AddEditNoteDialogProps) {
  const [deleteInProgress, setDeleteInProgress] = useState(false)
  const router = useRouter()

  const form = useForm<CreateNoteSchema>({
    // validate schema
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      title: noteToEdit?.title || '',
      content: noteToEdit?.content || '',
    },
  })

  async function onSubmit(input: CreateNoteSchema) {
    try {
      if (noteToEdit) {
        const response = await fetch('/api/notes', {
          method: 'PUT',
          body: JSON.stringify({
            id: noteToEdit.id,
            ...input,
          }),
        })
        if (!response.ok) throw Error('Status Code: ' + response.status)
      } else {
        const response = await fetch('/api/notes', {
          method: 'POST',
          body: JSON.stringify(input),
        })
        if (!response.ok) throw Error('Status Code: ' + response.status)
        form.reset()
      }
      router.refresh()
      setOpen(false)
    } catch (error) {
      console.error(error)
      alert('something went wrong')
    }
  }

  async function deleteNote() {
    if (!noteToEdit) return
    setDeleteInProgress(true)
    try {
      const response = await fetch('/api/notes', {
        method: 'DELETE',
        body: JSON.stringify({
          id: noteToEdit.id,
        }),
      })

      if (!response.ok) throw Error('Status code: ' + response.status)
    } catch (error) {
      console.error(error)
      alert('Something went wrong, please try again.')
    } finally {
      setDeleteInProgress(false)
      router.refresh()
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {noteToEdit ? 'Edit Note' : 'Add Note'}Add Note
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Content" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-1 sm:gap-0">
              {noteToEdit && (
                <LoadingButton
                  variant="destructive"
                  loading={deleteInProgress}
                  disabled={form.formState.isSubmitting}
                  onClick={deleteNote}
                  type="button"
                >
                  Delete
                </LoadingButton>
              )}

              <LoadingButton
                loading={form.formState.isSubmitting}
                type="submit"
              >
                Add
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddEditNoteDialog
