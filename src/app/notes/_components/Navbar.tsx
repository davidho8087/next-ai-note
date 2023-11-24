'use client'

import logo from '@/assets/images/logo.png'
import AddEditNoteDialog from '@/components/AddEditNoteDialog'
import AiChatButton from '@/components/AiChatButton'
import ThemeToggleButton from '@/components/ThemeToggleButton'
import { Button } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { Plus } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

function Navbar() {
  const { theme } = useTheme()
  const [showAddEditNoteDialog, setShowAddEditNoteDialog] = useState(false)

  return (
    <>
      <div className="p-4 shadow">
        <div className="m-auto flex max-w-7xl items-center justify-between gap-1">
          <Link href={'/notes'} className="flex items-center gap-2">
            <Image
              src={logo}
              alt="david logo"
              style={{
                width: '40px',
                height: 'auto',
              }}
              priority
            />
            <span className="font-bold">Note</span>
          </Link>

          {/*group*/}
          <div className="flex gap-2">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                baseTheme: theme === 'dark' ? dark : undefined,
                elements: {
                  avatarBox: { width: '2.5rem', height: '2.5rem' },
                },
              }}
            />

            <ThemeToggleButton />
            <Button onClick={() => setShowAddEditNoteDialog(true)}>
              <Plus size={20} className="mr-2" />
              Add Note
            </Button>
            <AiChatButton />
          </div>
        </div>
      </div>
      <AddEditNoteDialog
        open={showAddEditNoteDialog}
        setOpen={setShowAddEditNoteDialog}
      />
    </>
  )
}

export default Navbar
