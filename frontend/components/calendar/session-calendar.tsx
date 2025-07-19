'use client'

import { useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useAppSelector } from '@/store/hooks'
import { Card } from '@/components/ui/card'

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor?: string
  borderColor?: string
  extendedProps?: any
}

interface SessionCalendarProps {
  onDateSelect?: (selectInfo: any) => void
  onEventClick?: (clickInfo: any) => void
}

export function SessionCalendar({ onDateSelect, onEventClick }: SessionCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null)
  const { sessions } = useAppSelector((state) => state.mentorship)
  const { user } = useAppSelector((state) => state.auth)

  const events: CalendarEvent[] = sessions.map((session) => {
    const startDate = new Date(session.scheduledAt)
    const endDate = new Date(startDate.getTime() + session.duration * 60000)

    let backgroundColor = '#3788d8'
    if (session.status === 'completed') backgroundColor = '#22c55e'
    if (session.status === 'cancelled') backgroundColor = '#ef4444'

    return {
      id: session.id,
      title: session.title,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      backgroundColor,
      borderColor: backgroundColor,
      extendedProps: {
        description: session.description,
        mentorName: session.mentorName,
        menteeName: session.menteeName,
        status: session.status,
        meetingLink: session.meetingLink,
      },
    }
  })

  return (
    <Card className="p-4">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        editable={false}
        selectable={user?.role !== 'mentee'}
        selectMirror={true}
        select={onDateSelect}
        eventClick={onEventClick}
        height="auto"
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        weekends={true}
        nowIndicator={true}
        eventDisplay="block"
        dayMaxEvents={3}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: 'short',
        }}
      />
    </Card>
  )
}