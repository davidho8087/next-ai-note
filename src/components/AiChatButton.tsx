'use client'
import AiChatBot from '@/components/AiChatBot'
import { Button } from '@/components/ui/button'
import { Bot } from 'lucide-react'
import { useState } from 'react'

function AiChatButton() {
  const [chatBoxOpen, setChatBoxOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setChatBoxOpen(true)}>
        <Bot size={20} className="mr-2" />
        AI Chat
      </Button>
      <AiChatBot open={chatBoxOpen} onClose={() => setChatBoxOpen(false)} />
    </>
  )
}

export default AiChatButton
