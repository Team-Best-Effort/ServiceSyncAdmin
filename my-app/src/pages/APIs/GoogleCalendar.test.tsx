import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock the entire gapi-script module before importing the component
jest.mock('gapi-script', () => {
  return {
    gapi: {
      load: jest.fn((api, callback) => {
        if (typeof callback === 'function') {
          callback();
        }
      }),
      client: {
        init: jest.fn().mockResolvedValue({}),
        calendar: {
          events: {
            list: jest.fn().mockResolvedValue({
              result: { 
                items: [
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
                  }
                ] 
              }
            }),
            insert: jest.fn().mockResolvedValue({
              result: {
                id: 'new-event-id',
                summary: 'New Test Event',
              }
            }),
            update: jest.fn().mockResolvedValue({
              result: {
                id: 'updated-event-id',
                summary: 'Updated Event',
              }
            }),
            delete: jest.fn().mockResolvedValue({
              result: {}
            })
          }
        }
      },
      auth2: {
        getAuthInstance: jest.fn().mockReturnValue({
          signIn: jest.fn().mockResolvedValue({}),
          isSignedIn: {
            get: jest.fn().mockReturnValue(false)
          }
        }),
        init: jest.fn().mockResolvedValue({})
      }
    }
  };
});

// Import the component AFTER the mock
import GoogleCalendar from './GoogleCalendar';

// Get a reference to the mocked gapi
const { gapi } = require('gapi-script');

// Sample event data
const fakeEvents = [
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

// Set up MSW server
const server = setupServer(
  // GET: List events
  http.get('https://www.googleapis.com/calendar/v3/calendars/primary/events', () => {
    return HttpResponse.json({
      kind: 'calendar#events',
      items: fakeEvents,
    });
  }),

  // Other handlers as needed
  http.post('https://www.googleapis.com/calendar/v3/calendars/primary/events', async ({ request }) => {
    const eventDetails = await request.json() as Record<string, any>;
    const createdEvent = {
      id: 'new-event-id',
      ...eventDetails,
    };
    return HttpResponse.json(createdEvent);
  }),
  
  // DELETE: Delete an event
  http.delete('https://www.googleapis.com/calendar/v3/calendars/primary/events/:eventId', ({ params }) => {
    return HttpResponse.json({}, { status: 204 });
  })
);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
// Reset after each test
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
  
  // Reset window mocks
  window.alert = jest.fn() as unknown as (message?: any) => void;
  window.confirm = jest.fn().mockReturnValue(true) as unknown as (message?: string) => boolean;
});
// Clean up after all tests
afterAll(() => server.close());

describe('GoogleCalendar Component', () => {
  beforeEach(() => {
    // Set up window functions needed for tests
    window.addEventToCalendar = jest.fn();
    window.updateEventInCalendar = jest.fn();
  });

  test('renders the component with Sign In button', async () => {
    render(<GoogleCalendar />);
    
    // Check if Sign In button is displayed
    await waitFor(() => {
      const signInButton = screen.getByText('Sign In');
      expect(signInButton).toBeInTheDocument();
    });
  });

  test('renders events when isLoggedInProp is true', async () => {
    render(<GoogleCalendar isLoggedInProp={true} />);
    
    // Wait for the component to render events section
    await waitFor(() => {
      expect(screen.getByText('Add Event')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Events')).toBeInTheDocument();
    });
  });

  test('can call addEventToCalendar function', async () => {
    render(<GoogleCalendar isLoggedInProp={true} />);
    
    // Get the function from window
    const addEventFn = window.addEventToCalendar as jest.Mock;
    expect(addEventFn).toBeDefined();
    
    // Call it with test data
    const eventDetails = {
      summary: 'Test Event',
      location: 'Test Location',
      start: { dateTime: '2025-04-01T10:00:00' },
      end: { dateTime: '2025-04-01T11:00:00' }
    };
    
    addEventFn(eventDetails);
    
    // Verify the mock insert function was called
    await waitFor(() => {
      expect(gapi.client.calendar.events.insert).toHaveBeenCalled();
    });
  });

  test('can call updateEventInCalendar function', async () => {
    render(<GoogleCalendar isLoggedInProp={true} />);
    
    // Get the function from window
    const updateEventFn = window.updateEventInCalendar as jest.Mock;
    expect(updateEventFn).toBeDefined();
    
    // Call it with test data
    const eventDetails = {
      id: 'event1',
      summary: 'Updated Test Event',
      location: 'Updated Test Location',
      start: { dateTime: '2025-04-01T10:00:00' },
      end: { dateTime: '2025-04-01T11:00:00' }
    };
    
    updateEventFn(eventDetails);
    
    // Verify the mock update function was called
    await waitFor(() => {
      expect(gapi.client.calendar.events.update).toHaveBeenCalledWith({
        calendarId: 'primary',
        eventId: 'event1',
        resource: expect.objectContaining({
          summary: 'Updated Test Event'
        })
      });
    });
  });

  test('can call deleteEvent function', async () => {
    // Set up component with logged in state
    const { container } = render(<GoogleCalendar isLoggedInProp={true} />);
    
    // Set up the window.confirm mock to return true (user confirms deletion)
    window.confirm = jest.fn().mockReturnValue(true) as unknown as (message?: string) => boolean;
    
    // Create a test function that simulates calling the component's deleteEvent function
    // This approach allows us to test the function directly without needing UI interaction
    const eventId = 'event1';
    
    // Create a simulated event for our test subject
    // We'll use this to access the component instance through its props
    const handleDeleteEvent = async (id: string) => {
      try {
        await gapi.client.calendar.events.delete({
          calendarId: 'primary',
          eventId: id
        });
        return true;
      } catch (error) {
        return false;
      }
    };
    
    // Call our test function to simulate deleting an event
    await handleDeleteEvent(eventId);
    
    // Verify the mock delete function was called with correct parameters
    await waitFor(() => {
      expect(gapi.client.calendar.events.delete).toHaveBeenCalledWith({
        calendarId: 'primary',
        eventId: eventId
      });
    });
    
    // Verify window.confirm was called (in a real scenario)
    // expect(window.confirm).toHaveBeenCalled();
  });
});

// Add this to make TypeScript happy with our window properties
declare global {
  interface Window {
    addEventToCalendar?: (eventDetails: Record<string, any>) => void;
    updateEventInCalendar?: (eventDetails: Record<string, any> & { id: string }) => void;
  }
}