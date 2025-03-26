import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ServiceStatusPage from './page';

// Mock firebase/app
vi.mock('firebase/app', () => {
  const mockApp = {
    options: {},
    getProvider: vi.fn(() => {
      console.log('getProvider called');
      return {
        getImmediate: vi.fn(() => ({})),
        getOptional: vi.fn(() => ({})),
      };
    }),
  };

  return {
    initializeApp: vi.fn(() => {
      console.log('initializeApp called, returning mockApp');
      return mockApp;
    }),
    getApp: vi.fn(() => {
      console.log('getApp called, returning mockApp');
      return mockApp;
    }),
    SDK_VERSION: '11.3.1',
    _registerComponent: vi.fn(),
    registerVersion: vi.fn(),
  };
});

// Mock firebase/database
vi.mock('firebase/database', () => {
  const getMock = vi.fn();

  return {
    ref: vi.fn((path) => ({ path })),
    get: getMock.mockImplementation((ref) => {
      if (ref.path === 'ServiceSync' || ref.path === 'jobs') {
        return Promise.resolve({ exists: () => true });
      }
      return Promise.resolve({ exists: () => false });
    }),
    getDatabase: vi.fn(() => ({})),
  };
});

// Mock @mui/icons-material
vi.mock('@mui/icons-material', () => ({
  CheckCircleIcon: () => <svg data-testid="CheckCircleIcon" />,
  ErrorIcon: () => <svg data-testid="ErrorIcon" />,
}));

describe('ServiceStatusPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock implementation to default (both online)
    const getMock = require('firebase/database').get;
    getMock.mockImplementation((ref) => {
      if (ref.path === 'ServiceSync' || ref.path === 'jobs') {
        return Promise.resolve({ exists: () => true });
      }
      return Promise.resolve({ exists: () => false });
    });
  });

  it('displays all services up', async () => {
    render(<ServiceStatusPage />);

    await waitFor(() => {
      expect(screen.getByText('Online')).toBeInTheDocument(); // App/Auth (always online)
      expect(screen.getByText('Authentication service is running normally.')).toBeInTheDocument();

      expect(screen.getByText('Calendar database is running normally.')).toBeInTheDocument();
      expect(screen.getByText('Jobs database is running normally.')).toBeInTheDocument();

      // Check for CheckCircleIcon for all services
      const checkIcons = screen.getAllByTestId('CheckCircleIcon');
      expect(checkIcons).toHaveLength(3); // One for each service
    });
  });

  it('displays all services down', async () => {
    const getMock = require('firebase/database').get;
    getMock.mockImplementation((ref) => {
      if (ref.path === 'ServiceSync' || ref.path === 'jobs') {
        return Promise.resolve({ exists: () => false });
      }
      return Promise.resolve({ exists: () => false });
    });

    render(<ServiceStatusPage />);

    await waitFor(() => {
      expect(screen.getByText('Online')).toBeInTheDocument(); // App/Auth (always online)
      expect(screen.getByText('Authentication service is running normally.')).toBeInTheDocument();

      expect(screen.getByText('Calendar database is unavailable.')).toBeInTheDocument();
      expect(screen.getByText('Jobs database is unavailable.')).toBeInTheDocument();

      // Check for CheckCircleIcon for App/Auth, ErrorIcon for others
      expect(screen.getAllByTestId('CheckCircleIcon')).toHaveLength(1); // App/Auth
      expect(screen.getAllByTestId('ErrorIcon')).toHaveLength(2); // Calendar and Jobs
    });
  });

  it('displays calendar DB up, jobs DB down', async () => {
    const getMock = require('firebase/database').get;
    getMock.mockImplementation((ref) => {
      if (ref.path === 'ServiceSync') {
        return Promise.resolve({ exists: () => true });
      }
      if (ref.path === 'jobs') {
        return Promise.resolve({ exists: () => false });
      }
      return Promise.resolve({ exists: () => false });
    });

    render(<ServiceStatusPage />);

    await waitFor(() => {
      expect(screen.getByText('Online')).toBeInTheDocument(); // App/Auth
      expect(screen.getByText('Calendar database is running normally.')).toBeInTheDocument();
      expect(screen.getByText('Jobs database is unavailable.')).toBeInTheDocument();

      expect(screen.getAllByTestId('CheckCircleIcon')).toHaveLength(2); // App/Auth and Calendar
      expect(screen.getAllByTestId('ErrorIcon')).toHaveLength(1); // Jobs
    });
  });

  it('displays calendar DB down, jobs DB up', async () => {
    const getMock = require('firebase/database').get;
    getMock.mockImplementation((ref) => {
      if (ref.path === 'ServiceSync') {
        return Promise.resolve({ exists: () => false });
      }
      if (ref.path === 'jobs') {
        return Promise.resolve({ exists: () => true });
      }
      return Promise.resolve({ exists: () => false });
    });

    render(<ServiceStatusPage />);

    await waitFor(() => {
      expect(screen.getByText('Online')).toBeInTheDocument(); // App/Auth
      expect(screen.getByText('Calendar database is unavailable.')).toBeInTheDocument();
      expect(screen.getByText('Jobs database is running normally.')).toBeInTheDocument();

      expect(screen.getAllByTestId('CheckCircleIcon')).toHaveLength(2); // App/Auth and Jobs
      expect(screen.getAllByTestId('ErrorIcon')).toHaveLength(1); // Calendar
    });
  });

  it('displays calendar DB up, jobs DB down (alternate check)', async () => {
    const getMock = require('firebase/database').get;
    getMock.mockImplementation((ref) => {
      if (ref.path === 'ServiceSync') {
        return Promise.resolve({ exists: () => true });
      }
      if (ref.path === 'jobs') {
        return Promise.resolve({ exists: () => false });
      }
      return Promise.resolve({ exists: () => false });
    });

    render(<ServiceStatusPage />);

    await waitFor(() => {
      expect(screen.getByText('Online')).toBeInTheDocument(); // App/Auth
      expect(screen.getAllByText('Online')).toHaveLength(2); // App/Auth and Calendar
      expect(screen.getByText('Offline')).toBeInTheDocument(); // Jobs

      expect(screen.getAllByTestId('CheckCircleIcon')).toHaveLength(2); // App/Auth and Calendar
      expect(screen.getAllByTestId('ErrorIcon')).toHaveLength(1); // Jobs
    });
  });

  it('displays calendar DB down, jobs DB up (alternate check)', async () => {
    const getMock = require('firebase/database').get;
    getMock.mockImplementation((ref) => {
      if (ref.path === 'ServiceSync') {
        return Promise.resolve({ exists: () => false });
      }
      if (ref.path === 'jobs') {
        return Promise.resolve({ exists: () => true });
      }
      return Promise.resolve({ exists: () => false });
    });

    render(<ServiceStatusPage />);

    await waitFor(() => {
      expect(screen.getByText('Online')).toBeInTheDocument(); // App/Auth
      expect(screen.getAllByText('Online')).toHaveLength(2); // App/Auth and Jobs
      expect(screen.getByText('Offline')).toBeInTheDocument(); // Calendar

      expect(screen.getAllByTestId('CheckCircleIcon')).toHaveLength(2); // App/Auth and Jobs
      expect(screen.getAllByTestId('ErrorIcon')).toHaveLength(1); // Calendar
    });
  });
});