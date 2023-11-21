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
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

interface AddNoteDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
}

function AddNoteDialog({ open, setOpen }: AddNoteDialogProps) {
  const router = useRouter()

  const form = useForm<CreateNoteSchema>({
    // validate schema
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  })

  async function onSubmit(input: CreateNoteSchema) {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        body: JSON.stringify(input),
      })
      if (!response.ok) throw Error('Status Code: " + response.status')
      form.reset()
      router.refresh()
      setOpen(false)
    } catch (error) {
      console.error(error)
      alert('something went wrong')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
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
            <DialogFooter>
              <LoadingButton
                loading={form.formState.isSubmitting}
                type="submit"
              >
                Submit
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddNoteDialog
