'use client';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode } from 'react'


const events = [
  { title: 'Meeting with Sam', start: '2025-02-09T10:20:00', end: '2025-02-09T12:00:00' },
]

export function Calendar() {
  return (
    <div>
      <FullCalendar
        height={400}
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        weekends={true}
        events={events}
        eventContent={renderEventContent}
      />
    </div>
  )
}

// a custom render function
function renderEventContent(eventInfo: { timeText: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; event: { title: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined } }) {
  return (
    <>
      <b>{eventInfo.timeText}</b>&nbsp;
      <i>{eventInfo.event.title}</i>
    </>
  )
}