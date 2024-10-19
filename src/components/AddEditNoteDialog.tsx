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
import { categoryOptions } from '@/lib/mock/metaData'
import { CreateNoteSchema, createNoteSchema } from '@/lib/validation/note'
import { zodResolver } from '@hookform/resolvers/zod'
import { Note } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

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
      metadata: noteToEdit?.metadata || '',
      subTitle: noteToEdit?.subTitle || '',
      content: noteToEdit?.content || '',
    },
  })

  async function onSubmit(input: CreateNoteSchema) {
    const noteData = input

    try {
      if (noteToEdit) {
        const response = await fetch('/api/notes', {
          method: 'PUT',
          body: JSON.stringify({
            id: noteToEdit.id,
            ...noteData,
          }),
        })
        if (!response.ok) throw Error('Status Code: ' + response.status)
      } else {
        const response = await fetch('/api/notes', {
          method: 'POST',
          body: JSON.stringify(noteData),
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
      <DialogContent className="w-[90vw] max-w-3xl">
        <DialogHeader>
          <DialogTitle>{noteToEdit ? 'Edit Stuff' : 'Add Stuff'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Select for Intents */}
            <FormField
              control={form.control}
              name="metadata"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Metadata</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger id="metaData">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <Textarea placeholder="" {...field} className="h-96" />
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
                {noteToEdit ? 'Update' : 'Add'}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddEditNoteDialog
