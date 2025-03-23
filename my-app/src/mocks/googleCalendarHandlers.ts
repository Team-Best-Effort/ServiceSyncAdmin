import { http, HttpResponse } from 'msw';

// Define types for our events
interface CalendarEventDateTime {
  dateTime?: string;
  timeZone?: string;
  date?: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  location?: string;
  description?: string;
  start: CalendarEventDateTime;
  end: CalendarEventDateTime;
  [key: string]: any; // Allow for additional properties
}

// Store events in memory to simulate a database
let fakeEvents: CalendarEvent[] = [
  {
    id: 'event1',
    summary: 'Clogged Drain at 123 Example St',
    location: '123 Example St',
    description: 'Fix clogged kitchen sink',
    start: { dateTime: '2025-04-01T09:00:00-07:00' },
    end: { dateTime: '2025-04-01T10:00:00-07:00' },
  },
  {
    id: 'event2',
    summary: 'Toilet Repair at 456 Test Ln',
    location: '456 Test Ln',
    description: 'Replace toilet flapper valve',
    start: { dateTime: '2025-04-02T11:00:00-07:00' },
    end: { dateTime: '2025-04-02T12:00:00-07:00' },
  },
];

// Generate a unique ID for new events
let lastEventId = 2;
const generateEventId = () => {
  lastEventId++;
  return `event${lastEventId}`;
};

export const googleCalendarHandlers = [
  // GET: List upcoming events
  http.get('https://www.googleapis.com/calendar/v3/calendars/primary/events', () => {
    return HttpResponse.json({
      kind: 'calendar#events',
      items: fakeEvents,
    });
  }),

  // POST: Insert a new event
  http.post('https://www.googleapis.com/calendar/v3/calendars/primary/events', async ({ request }) => {
    // Parse the request body
    const eventDetailsRaw = await request.json();
    
    // Generate a new ID for the event
    const newEventId = generateEventId();
    
    // Make sure we have the required fields with defaults if needed
    const eventDetails = eventDetailsRaw as Record<string, any>;
    
    // Create the new event with the generated ID and required fields
    const createdEvent: CalendarEvent = {
      id: newEventId,
      summary: eventDetails.summary || 'Untitled Event',
      start: eventDetails.start || { dateTime: new Date().toISOString() },
      end: eventDetails.end || { dateTime: new Date().toISOString() },
      // Add any other fields from the original request
      ...eventDetails
    };
    
    // Add the event to our "database"
    fakeEvents.push(createdEvent);
    
    return HttpResponse.json(createdEvent);
  }),

  // PUT: Update an existing event
  http.put('https://www.googleapis.com/calendar/v3/calendars/primary/events/:eventId', async ({ params, request }) => {
    // Cast params to the expected type to get eventId as string
    const paramsCast = params as { eventId: string };
    const eventId = String(paramsCast.eventId);
    
    // Parse the request body
    const updatedEventDetailsRaw = await request.json();
    const updatedEventDetails = updatedEventDetailsRaw as Record<string, any>;
    
    // Find the event in our "database"
    const eventIndex = fakeEvents.findIndex(event => event.id === eventId);
    
    if (eventIndex === -1) {
      // Event not found
      return HttpResponse.json({
        error: {
          code: 404,
          message: 'Event not found',
        }
      }, { status: 404 });
    }
    
    // Update the event by merging the existing event with the updated details
    const updatedEvent: CalendarEvent = {
      ...fakeEvents[eventIndex],
      ...updatedEventDetails,
      id: eventId, // Ensure ID doesn't change
    };
    
    fakeEvents[eventIndex] = updatedEvent;
    
    return HttpResponse.json(updatedEvent);
  }),

  // DELETE: Delete an event
  http.delete('https://www.googleapis.com/calendar/v3/calendars/primary/events/:eventId', ({ params }) => {
    // Cast params to the expected type to get eventId as string
    const paramsCast = params as { eventId: string };
    const eventId = String(paramsCast.eventId);
    
    // Find the event in our "database"
    const eventIndex = fakeEvents.findIndex(event => event.id === eventId);
    
    if (eventIndex === -1) {
      // Event not found
      return HttpResponse.json({
        error: {
          code: 404,
          message: 'Event not found',
        }
      }, { status: 404 });
    }
    
    // Remove the event from our "database"
    fakeEvents.splice(eventIndex, 1);
    
    // Return an empty response for successful deletion
    return new HttpResponse(null, { status: 204 });
  }),
];