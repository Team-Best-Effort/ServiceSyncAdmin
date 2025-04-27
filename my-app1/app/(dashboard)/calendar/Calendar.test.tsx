import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Calendar } from './Calender';
import '@testing-library/jest-dom';
import * as firebase from 'firebase/database';

vi.mock('@fullcalendar/react', () => {
  const MockFullCalendar = vi.fn().mockImplementation((props: any) => {
    return (
      <div data-testid="mock-calendar">
        <div className="fc-header-toolbar">
          <h2>March 2025</h2>
        </div>
        <div className="fc-events-container">
          {props.events?.map((event: any) => (
            <button
              key={event.id}
              className="fc-event"
              data-testid={`event-${event.id}`}
              onClick={() => props.eventClick?.({ event: { id: event.id, title: event.title } })}
            >
              <div data-testid={`event-title-${event.id}`}>{event.title}</div>
              <div data-testid={`event-desc-${event.id}`}>{event.extendedProps?.description}</div>
            </button>
          ))}
        </div>
      </div>
    );
  });

  return {
    __esModule: true,
    default: MockFullCalendar,
  };
});

vi.mock('@fullcalendar/daygrid', () => ({
  __esModule: true,
  default: {},
}));

vi.mock('firebase/database', () => ({
  ref: vi.fn((db, path) => ({ db, path, key: path?.split('/')[1] })),
  set: vi.fn().mockResolvedValue(undefined),
  get: vi.fn(),
  child: vi.fn((ref) => ref),
  update: vi.fn().mockResolvedValue(undefined),
  remove: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../auth', () => ({
  db: {
    app: {
      name: 'test-app',
      options: {},
      automaticDataCollectionEnabled: false,
    },
    type: 'database',
  },
}));

class MockDataSnapshot {
  constructor(private readonly data: any, private readonly _exists: boolean = true) {}
  val() {
    return this.data;
  }
  exists() {
    return this._exists;
  }
}

describe('Calendar Component', () => {
  const mockTasks = {
    '1678912345000': {
      title: 'Fix Kitchen Sink Clog',
      description: 'Kitchen sink is completely clogged and needs urgent service',
      status: 'pending',
      start: '2025-03-24T09:00:00.000Z',
      end: '2025-03-24T11:00:00.000Z',
      createdAt: '2025-03-23T08:00:00.000Z',
    },
    '1678912345001': {
      title: 'Repair Bathroom Drain',
      description: 'Bathroom drain is leaking and causing water damage',
      status: 'in-progress',
      start: '2025-03-25T14:00:00.000Z',
      end: null,
      createdAt: '2025-03-23T09:00:00.000Z',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const mockSnapshot = new MockDataSnapshot(mockTasks);
    vi.mocked(firebase.get).mockResolvedValue(mockSnapshot as any);
    vi.spyOn(Date, 'now').mockImplementation(() => 1679000000000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the calendar with tasks', async () => {
    await act(async () => {
      render(<Calendar />);
    });

    await waitFor(() => {
      expect(firebase.get).toHaveBeenCalled();
    });

    expect(screen.getByTestId('event-title-1678912345000')).toHaveTextContent('Fix Kitchen Sink Clog');
    expect(screen.getByTestId('event-title-1678912345001')).toHaveTextContent('Repair Bathroom Drain');
  });

  it('successfully adds a new task', async () => {
    await act(async () => {
      render(<Calendar />);
    });

    const addButton = screen.getByText('Add New Event'); // Updated

    await act(async () => {
      fireEvent.click(addButton);
    });

    await act(async () => {
      const titleInput = screen.getByLabelText(/Title/i);
      fireEvent.change(titleInput, { target: { value: 'Install New Water Heater' } });

      const descriptionInput = screen.getByLabelText(/Description/i);
      fireEvent.change(descriptionInput, { target: { value: 'Customer needs a new 50-gallon water heater installed in basement' } });

      const startDateInput = screen.getByLabelText(/Start Date/i);
      fireEvent.change(startDateInput, { target: { value: '2025-03-26T10:00' } });

      const endDateInput = screen.getByLabelText(/End Date/i);
      fireEvent.change(endDateInput, { target: { value: '2025-03-26T14:00' } });
    });

    await act(async () => {
      const submitButton = screen.getByRole('button', { name: /add/i }); // More flexible
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(firebase.set).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          title: 'Install New Water Heater',
          description: 'Customer needs a new 50-gallon water heater installed in basement',
          start: expect.any(String),
        })
      );
    });
  });

  it('successfully modifies an existing task', async () => {
    await act(async () => {
      render(<Calendar />);
    });

    await waitFor(() => {
      expect(firebase.get).toHaveBeenCalled();
    });

    const mockEvent = { id: '1678912345000', title: 'Fix Kitchen Sink Clog' };

    await act(async () => {
      await firebase.update(
        { path: `ServiceSync/${mockEvent.id}` } as any,
        {
          title: 'Fixed Kitchen Sink - Severe Clog',
          description: 'Successfully removed severe clog from kitchen drain using snake tool',
          status: 'completed',
          start: '2025-03-24T09:00:00.000Z',
          end: '2025-03-24T10:30:00.000Z',
          createdAt: '2025-03-23T08:00:00.000Z',
        }
      );
    });

    expect(firebase.update).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        title: 'Fixed Kitchen Sink - Severe Clog',
        description: 'Successfully removed severe clog from kitchen drain using snake tool',
        status: 'completed',
      })
    );
  });

  it('successfully deletes a task', async () => {
    await act(async () => {
      render(<Calendar />);
    });

    await waitFor(() => {
      expect(firebase.get).toHaveBeenCalled();
    });

    const mockEvent = { id: '1678912345001', title: 'Repair Bathroom Drain' };

    await act(async () => {
      await firebase.remove({ path: `ServiceSync/${mockEvent.id}` } as any);
    });

    expect(firebase.remove).toHaveBeenCalledWith(
      expect.objectContaining({
        path: `ServiceSync/${mockEvent.id}`,
      })
    );
  });

  it('handles Firebase fetch errors gracefully', async () => {
    vi.mocked(firebase.get).mockRejectedValue(new Error('Firebase connection error'));
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await act(async () => {
      render(<Calendar />);
    });

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to fetch tasks from Firebase:',
        expect.any(Error)
      );
    });

    consoleWarnSpy.mockRestore();
  });
});
