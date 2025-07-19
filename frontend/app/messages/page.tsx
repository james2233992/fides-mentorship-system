'use client'

import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Search } from 'lucide-react'
import { format } from 'date-fns'
import { io, Socket } from 'socket.io-client'
import { toast } from '@/hooks/use-toast'

interface Message {
  id: string
  senderId: string
  recipientId: string
  content: string
  isRead: boolean
  createdAt: string
  sender?: {
    id: string
    firstName: string
    lastName: string
    profilePicture?: string
  }
  recipient?: {
    id: string
    firstName: string
    lastName: string
    profilePicture?: string
  }
}

interface Conversation {
  userId: string
  firstName: string
  lastName: string
  profilePicture?: string
  lastMessage?: Message
  unreadCount: number
}

export default function MessagesPage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const token = useSelector((state: RootState) => state.auth.token)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (!token) return

    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      path: '/messages',
      auth: {
        token: token
      }
    })

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket')
    })

    socketInstance.on('newMessage', (message: Message) => {
      setMessages(prev => [...prev, message])
      updateConversationsList(message)
    })

    socketInstance.on('messageRead', ({ messageId, recipientId }: { messageId: string; recipientId: string }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      )
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [token])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      })
    }
  }

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/conversation/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data)
        markMessagesAsRead(userId)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      })
    }
  }

  const markMessagesAsRead = async (userId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/mark-read/${userId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: selectedConversation,
          content: newMessage,
        }),
      })

      if (response.ok) {
        setNewMessage('')
        const message = await response.json()
        if (socket) {
          socket.emit('sendMessage', message)
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      })
    }
  }

  const updateConversationsList = (message: Message) => {
    setConversations(prev => {
      const existingIndex = prev.findIndex(
        conv => conv.userId === message.senderId || conv.userId === message.recipientId
      )

      if (existingIndex === -1) return prev

      const updated = [...prev]
      updated[existingIndex] = {
        ...updated[existingIndex],
        lastMessage: message,
        unreadCount: message.senderId !== user?.id ? updated[existingIndex].unreadCount + 1 : 0
      }

      return updated.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt || '0'
        const bTime = b.lastMessage?.createdAt || '0'
        return bTime.localeCompare(aTime)
      })
    })
  }

  const filteredConversations = conversations.filter(conv =>
    `${conv.firstName} ${conv.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedUser = conversations.find(conv => conv.userId === selectedConversation)

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p>Please log in to view messages</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-350px)]">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.userId}
                  onClick={() => {
                    setSelectedConversation(conversation.userId)
                    fetchMessages(conversation.userId)
                  }}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                    selectedConversation === conversation.userId ? 'bg-gray-100' : ''
                  }`}
                >
                  <Avatar>
                    <AvatarImage src={conversation.profilePicture} />
                    <AvatarFallback>
                      {conversation.firstName[0]}{conversation.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="flex justify-between items-baseline">
                      <p className="font-semibold">
                        {conversation.firstName} {conversation.lastName}
                      </p>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {format(new Date(conversation.lastMessage.createdAt), 'MMM d')}
                        </span>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                    {conversation.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="md:col-span-2">
          {selectedConversation && selectedUser ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedUser.profilePicture} />
                    <AvatarFallback>
                      {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h3>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[calc(100vh-400px)]">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwnMessage = message.senderId === user.id
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isOwnMessage
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {format(new Date(message.createdAt), 'HH:mm')}
                              {isOwnMessage && message.isRead && ' ✓✓'}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <form onSubmit={sendMessage} className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit" size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full text-gray-500">
              <p>Select a conversation to start messaging</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}