'use client'

import logo from '@/assets/images/logo.png'
import AddEditNoteDialog from '@/components/AddEditNoteDialog'
import { Button } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'
import { Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

function Navbar() {
  const [showAddEditNoteDialog, setShowAddEditNoteDialog] = useState(false)

  return (
    <>
      <div className="p-4 shadow">
        <div className="m-auto flex max-w-7xl items-center justify-between gap-1">
          <Link href={'/notes'} className="flex items-center gap-2">
            <Image src={logo} alt="david logo" width={40} height={40} />
            <span className="font-bold">Note</span>
          </Link>

          {/*group*/}
          <div className="flex gap-2">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: { width: '2.5rem', height: '2.5rem' },
                },
              }}
            />
            <Button onClick={() => setShowAddEditNoteDialog(true)}>
              <Plus size={20} className="mr-2" />
              Add Note
            </Button>
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
