import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { gapi } from "gapi-script";

// Use environment variables if available, otherwise fallback to hardcoded values
// Note: For production, you should use environment variables only
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || "1078271580806-836nbl8fq47o6539av0sglok9g04et9q.apps.googleusercontent.com";
const API_KEY = process.env.REACT_APP_API_KEY || "AIzaSyA1eRL5YoMiWQmZcMoq3W28I-TwOzwo9nw";
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

// Define types for calendar events
interface CalendarEvent {
    id: string;
    summary: string;
    location?: string;
    description?: string;
    start: {
        dateTime?: string;
        timeZone?: string;
        date?: string;
    };
    end: {
        dateTime?: string;
        timeZone?: string;
        date?: string;
    };
    [key: string]: any; // Allow for additional properties
}

interface GoogleCalendarProps {
    // Optional prop for tests to override isLoggedIn state
    isLoggedInProp?: boolean;
}

const GoogleCalendar: React.FC<GoogleCalendarProps> = ({ isLoggedInProp }) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]); // State to hold fetched events
    const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // State for the selected date
    const [isLoggedIn, setIsLoggedIn] = useState(!!isLoggedInProp);

    // Initialize Google API client
    useEffect(() => {
        const initClient = async () => {
            try {
                await gapi.client.init({
                    apiKey: API_KEY,
                    clientId: CLIENT_ID,
                    discoveryDocs: [
                        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
                    ],
                    scope: SCOPES,
                });
                console.log("Google API initialized");
                
                // Check if already signed in - need to ensure auth2 is available
                if (gapi.auth2) {
                    try {
                        const authInstance = gapi.auth2.getAuthInstance();
                        if (authInstance && authInstance.isSignedIn && authInstance.isSignedIn.get()) {
                            setIsLoggedIn(true);
                            listUpcomingEvents(); // Fetch events if already logged in
                        }
                    } catch (err) {
                        console.error("Error checking auth status:", err);
                    }
                }
            } catch (error) {
                console.error("Error initializing Google API:", error);
            }
        };

        const loadGapiClient = () => {
            gapi.load("client:auth2", initClient);
        };

        // Load the Google API client
        loadGapiClient();

        // For tests - if isLoggedInProp is true, automatically load events
        if (isLoggedInProp) {
            setIsLoggedIn(true);
            listUpcomingEvents();
        }

        // Expose the event management functions to the window object for popup windows
        window.addEventToCalendar = addEventToCalendar;
        window.updateEventInCalendar = updateEventInCalendar;
        
        // Clean up function to remove the window methods when component unmounts
        return () => {
            delete window.addEventToCalendar;
            delete window.updateEventInCalendar;
        };
    }, [isLoggedInProp]);

    const listUpcomingEvents = async () => {
        try {
            const response = await gapi.client.calendar.events.list({
                calendarId: "primary",
                timeMin: new Date().toISOString(),
                showDeleted: false,
                singleEvents: true,
                maxResults: 10,
                orderBy: "startTime",
            });
            
            // Convert the Google Calendar API events to our CalendarEvent type
            const apiEvents = response.result.items || [];
            const typedEvents: CalendarEvent[] = apiEvents.map(event => ({
                id: event.id || '',
                summary: event.summary || '',
                location: event.location,
                description: event.description,
                start: {
                    dateTime: event.start?.dateTime,
                    timeZone: event.start?.timeZone,
                    date: event.start?.date
                },
                end: {
                    dateTime: event.end?.dateTime,
                    timeZone: event.end?.timeZone,
                    date: event.end?.date
                }
            }));
            
            setEvents(typedEvents);
        } catch (error) {
            console.error("Error fetching calendar events:", error);
        }
    };

    const handleAuthClick = async () => {
        try {
            // Ensure auth2 is available before trying to get the auth instance
            if (gapi.auth2) {
                try {
                    const authInstance = gapi.auth2.getAuthInstance();
                    if (authInstance) {
                        await authInstance.signIn();
                        setIsLoggedIn(true);
                        listUpcomingEvents(); // Fetch events after login
                    } else {
                        console.error("Auth instance not available");
                    }
                } catch (err) {
                    console.error("Error with auth instance:", err);
                }
            } else {
                console.error("Auth2 not available in gapi");
            }
        } catch (error) {
            console.error("Error during login:", error);
        }
    };

    const handleAddEvent = () => {
        // Open a new pop-up window to add event
        const popUpWindow = window.open(
            "",
            "Add Event",
            "width=600,height=400,left=100,top=100"
        );

        if (popUpWindow) {
            // Pass the form HTML to the pop-up window
            popUpWindow.document.write(`
                <html>
                <head><title>Add Event</title></head>
                <body>
                    <h2>Add Event</h2>
                    <form id="addEventForm">
                        <label>Summary:</label>
                        <input type="text" id="summary" required /><br />
                        <label>Location:</label>
                        <input type="text" id="location" /><br />
                        <label>Description:</label>
                        <input type="text" id="description" /><br />
                        <label>Start Time:</label>
                        <input type="datetime-local" id="startTime" required /><br />
                        <label>End Time:</label>
                        <input type="datetime-local" id="endTime" required /><br />
                        <button type="submit">Add Event</button>
                    </form>
                    <script>
                        document.getElementById("addEventForm").addEventListener("submit", function(event) {
                            event.preventDefault();
                            const eventDetails = {
                                summary: document.getElementById("summary").value,
                                location: document.getElementById("location").value,
                                description: document.getElementById("description").value,
                                start: {
                                    dateTime: document.getElementById("startTime").value,
                                    timeZone: "America/Los_Angeles",
                                },
                                end: {
                                    dateTime: document.getElementById("endTime").value,
                                    timeZone: "America/Los_Angeles",
                                }
                            };

                            window.opener.addEventToCalendar(eventDetails); // Pass data back to the main window
                            window.close(); // Close the pop-up window
                        });
                    </script>
                </body>
                </html>
            `);
        }
    };

    const handleEditEvent = (event: CalendarEvent) => {
        // Open a new pop-up window to edit event
        const popUpWindow = window.open(
            "",
            "Edit Event",
            "width=600,height=400,left=100,top=100"
        );

        if (popUpWindow && event) {
            // Get the start and end times in the right format for datetime-local input
            const startDateTime = event.start.dateTime ? new Date(event.start.dateTime) : new Date();
            const endDateTime = event.end.dateTime ? new Date(event.end.dateTime) : new Date();
            
            const formatDateTime = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}`;
            };

            const startValue = formatDateTime(startDateTime);
            const endValue = formatDateTime(endDateTime);

            // Pass the form HTML to the pop-up window
            popUpWindow.document.write(`
                <html>
                <head><title>Edit Event</title></head>
                <body>
                    <h2>Edit Event</h2>
                    <form id="editEventForm">
                        <input type="hidden" id="eventId" value="${event.id}" />
                        <label>Summary:</label>
                        <input type="text" id="summary" value="${event.summary || ''}" required /><br />
                        <label>Location:</label>
                        <input type="text" id="location" value="${event.location || ''}" /><br />
                        <label>Description:</label>
                        <input type="text" id="description" value="${event.description || ''}" /><br />
                        <label>Start Time:</label>
                        <input type="datetime-local" id="startTime" value="${startValue}" required /><br />
                        <label>End Time:</label>
                        <input type="datetime-local" id="endTime" value="${endValue}" required /><br />
                        <button type="submit">Update Event</button>
                    </form>
                    <script>
                        document.getElementById("editEventForm").addEventListener("submit", function(event) {
                            event.preventDefault();
                            const eventDetails = {
                                id: document.getElementById("eventId").value,
                                summary: document.getElementById("summary").value,
                                location: document.getElementById("location").value,
                                description: document.getElementById("description").value,
                                start: {
                                    dateTime: document.getElementById("startTime").value,
                                    timeZone: "America/Los_Angeles",
                                },
                                end: {
                                    dateTime: document.getElementById("endTime").value,
                                    timeZone: "America/Los_Angeles",
                                }
                            };

                            window.opener.updateEventInCalendar(eventDetails); // Pass data back to the main window
                            window.close(); // Close the pop-up window
                        });
                    </script>
                </body>
                </html>
            `);
        }
    };

    const addEventToCalendar = async (eventDetails: Record<string, any>) => {
        try {
            // Convert our eventDetails to the Google Calendar API format
            const eventInput = {
                summary: eventDetails.summary,
                location: eventDetails.location,
                description: eventDetails.description,
                start: eventDetails.start,
                end: eventDetails.end,
            };
            
            const response = await gapi.client.calendar.events.insert({
                calendarId: "primary",
                resource: eventInput,
            });
            console.log("Event added successfully:", response.result);
            alert(`Event created: ${response.result.summary}`);
            listUpcomingEvents(); // Refresh events
        } catch (error) {
            console.error("Error creating event:", error);
            alert("Failed to create event. Please try again.");
        }
    };

    const updateEventInCalendar = async (eventDetails: Record<string, any> & { id: string }) => {
        try {
            const { id, ...details } = eventDetails;
            
            // Convert our eventDetails to the Google Calendar API format
            const eventInput = {
                summary: details.summary,
                location: details.location,
                description: details.description,
                start: details.start,
                end: details.end,
            };
            
            const response = await gapi.client.calendar.events.update({
                calendarId: "primary",
                eventId: id,
                resource: eventInput,
            });
            console.log("Event updated successfully:", response.result);
            alert(`Event updated: ${response.result.summary}`);
            listUpcomingEvents(); // Refresh events
        } catch (error) {
            console.error("Error updating event:", error);
            alert("Failed to update event. Please try again.");
        }
    };

    const deleteEvent = async (eventId: string) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                await gapi.client.calendar.events.delete({
                    calendarId: "primary",
                    eventId: eventId,
                });
                console.log("Event deleted successfully");
                alert("Event deleted successfully");
                listUpcomingEvents(); // Refresh events
            } catch (error) {
                console.error("Error deleting event:", error);
                alert("Failed to delete event. Please try again.");
            }
        }
    };

    const tileClassName = ({ date }: { date: Date }) => {
        const eventDate = date.toISOString().split("T")[0]; // Format the date as YYYY-MM-DD
        const eventOnDate = events.some(
            (event) => {
                const startDateTime = event.start?.dateTime?.split("T")[0];
                const startDate = event.start?.date?.split("T")[0];
                return startDateTime === eventDate || startDate === eventDate;
            }
        );
        return eventOnDate ? "highlight-event" : "";
    };

    // Format event date for display
    const formatEventDate = (dateTimeString: string | undefined) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return date.toLocaleString();
    };

    return (
        <div className="calendar-container">
            {!isLoggedIn ? (
                <button onClick={handleAuthClick} className="auth-button">Sign In</button>
            ) : (
                <>
                    <h2>Google Calendar</h2>
                    <button onClick={handleAddEvent} className="add-button">Add Event</button>
                    
                    <div className="calendar-wrapper">
                        <Calendar
                            value={selectedDate}
                            onChange={(value) => {
                                if (value instanceof Date) {
                                    setSelectedDate(value);
                                }
                            }}
                            tileClassName={tileClassName}
                        />
                    </div>
                    
                    <div className="events-list">
                        <h3>Upcoming Events</h3>
                        {events.length === 0 ? (
                            <p>No upcoming events found.</p>
                        ) : (
                            <ul>
                                {events.map((event) => (
                                    <li key={event.id} className="event-item">
                                        <div className="event-details">
                                            <h4>{event.summary}</h4>
                                            <p>
                                                <strong>When:</strong> {formatEventDate(event.start?.dateTime || event.start?.date)} - 
                                                {formatEventDate(event.end?.dateTime || event.end?.date)}
                                            </p>
                                            {event.location && <p><strong>Where:</strong> {event.location}</p>}
                                            {event.description && <p><strong>Details:</strong> {event.description}</p>}
                                        </div>
                                        <div className="event-actions">
                                            <button onClick={() => handleEditEvent(event)} className="edit-button">Edit</button>
                                            <button onClick={() => deleteEvent(event.id)} className="delete-button">Delete</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// Declare global window interface extensions
declare global {
    interface Window {
        addEventToCalendar?: (eventDetails: Record<string, any>) => void;
        updateEventInCalendar?: (eventDetails: Record<string, any> & { id: string }) => void;
    }
}

export default GoogleCalendar;