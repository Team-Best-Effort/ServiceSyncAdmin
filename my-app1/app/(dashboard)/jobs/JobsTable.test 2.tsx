import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import JobsPage from './page';

// Mock firebase/app
vi.mock('firebase/app', () => {
  const mockApp = {
    options: {},
    name: '[DEFAULT]',
    automaticDataCollectionEnabled: false,
  };

  return {
    initializeApp: vi.fn(() => mockApp),
    getApp: vi.fn(() => mockApp),
    SDK_VERSION: '11.3.1',
    _registerComponent: vi.fn(),
    registerVersion: vi.fn(),
  };
});

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ app: { name: '[DEFAULT]' } })),
}));

// Mock firebase/database
vi.mock('firebase/database', () => {
  const getMock = vi.fn();

  return {
    ref: vi.fn((path) => ({ path })),
    get: getMock.mockImplementation(() => Promise.resolve({ exists: () => false })),
    getDatabase: vi.fn(() => ({})),
  };
});

describe('JobsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock implementation to default (no jobs)
    const getMock = require('firebase/database').get;
    getMock.mockImplementation(() => Promise.resolve({ exists: () => false }));
  });

  it('displays a message when there are no jobs', async () => {
    render(<JobsPage />);

    await waitFor(() => {
      expect(screen.getByText('No jobs available')).toBeInTheDocument();
    });
  });

  it('displays a table with jobs when jobs are available', async () => {
    // Mock Firebase to return some jobs
    const getMock = require('firebase/database').get;
    getMock.mockImplementation(() =>
      Promise.resolve({
        exists: () => true,
        val: () => ({
          job1: { title: 'Job 1', status: 'Active', date: '2025-03-25' },
          job2: { title: 'Job 2', status: 'Completed', date: '2025-03-24' },
        }),
      })
    );

    render(<JobsPage />);

    await waitFor(() => {
      // Verify table headers
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();

      // Verify job data
      expect(screen.getByText('job1')).toBeInTheDocument();
      expect(screen.getByText('Job 1')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('2025-03-25')).toBeInTheDocument();

      expect(screen.getByText('job2')).toBeInTheDocument();
      expect(screen.getByText('Job 2')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('2025-03-24')).toBeInTheDocument();
    });
  });
});