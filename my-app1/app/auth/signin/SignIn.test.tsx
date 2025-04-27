import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import SignIn from './page';
import React from 'react';
import mockSignIn from './actions'; // ✅ Import with correct path

// ✅ Mock firebase/app
vi.mock('firebase/app', () => {
  const fakeAuthProvider = {
    getImmediate: vi.fn(() => ({ app: { name: '[DEFAULT]' } })),
    getOptional: vi.fn(),
  };

  const mockApp = {
    options: {},
    name: '[DEFAULT]',
    automaticDataCollectionEnabled: false,
    getProvider: vi.fn(() => fakeAuthProvider),
  };

  return {
    initializeApp: vi.fn(() => mockApp),
    getApp: vi.fn(() => mockApp),
    SDK_VERSION: '11.3.1',
    _registerComponent: vi.fn(),
    registerVersion: vi.fn(),
  };
});

// ✅ Mock firebase/database
vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(() => ({
    app: {
      name: 'service_sync',
    },
  })),
  ref: vi.fn(() => ({})),
  get: vi.fn(() => Promise.resolve({ exists: () => false })),
}));

// ✅ Mock firebase/auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    app: {
      name: '[DEFAULT]',
      getProvider: vi.fn(() => ({
        getImmediate: vi.fn(() => ({})),
        getOptional: vi.fn(() => ({})),
      })),
    },
  })),
}));

// ✅ Mock next-auth with default + named exports
vi.mock('next-auth', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    handlers: {},
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
  signIn: vi.fn(),
  getServerSession: vi.fn(),
}));

// ✅ Correct mock path for actions
vi.mock('./actions', () => ({
  default: vi.fn(),
}));

// ✅ Mock providerMap
vi.mock('../auth', () => ({
  providerMap: [
    { id: 'credentials', name: 'Email and Password' },
  ],
}));

// ✅ Mock SignInPage
vi.mock('@toolpad/core/SignInPage', () => ({
  SignInPage: (props) => {
    const [error, setError] = React.useState(null);
    return (
      <div data-testid="sign-in-page">
        <h2>
          <span style={{ color: '#cbcecd' }}>Sign in to Service</span>
          <span style={{ color: '#00c4cc' }}>Sync</span>
        </h2>
        <div>{props.slots.subtitle()}</div>
        {error && <div data-testid="error-message">{error.message}</div>}
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            try {
              await props.signIn('credentials', formData);
              setError(null);
            } catch (err) {
              setError(err);
            }
          }}
        >
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" data-testid="email-input" />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" data-testid="password-input" />
          <button type="submit" data-testid="submit-button">Sign In</button>
        </form>
      </div>
    );
  },
}));

// ✅ Mock AppProvider
vi.mock('@toolpad/core/AppProvider', () => ({
  AppProvider: (props) => <div data-testid="app-provider">{props.children}</div>,
}));

describe('SignIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const matchHeading = (content: string, element: Element | null) => {
    return element?.textContent?.replace(/\s+/g, '') === 'SignintoServiceSync';
  };

  it('successfully logs in with valid credentials', async () => {
    mockSignIn.mockResolvedValueOnce({ success: true });

    render(<SignIn />);

    expect(screen.getByText(matchHeading)).toBeInTheDocument();
    expect(screen.getByText('Please log in with your credinetials')).toBeInTheDocument();

    await userEvent.type(screen.getByTestId('email-input'), 'test@example.com');
    await userEvent.type(screen.getByTestId('password-input'), 'password123');
    await userEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', expect.any(FormData));
      const formData = mockSignIn.mock.calls[0][1];
      expect(formData.get('email')).toBe('test@example.com');
      expect(formData.get('password')).toBe('password123');
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  it('fails to log in with invalid credentials', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(<SignIn />);

    expect(screen.getByText(matchHeading)).toBeInTheDocument();
    expect(screen.getByText('Please log in with your credinetials')).toBeInTheDocument();

    await userEvent.type(screen.getByTestId('email-input'), 'wrong@example.com');
    await userEvent.type(screen.getByTestId('password-input'), 'wrongpassword');
    await userEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', expect.any(FormData));
      const formData = mockSignIn.mock.calls[0][1];
      expect(formData.get('email')).toBe('wrong@example.com');
      expect(formData.get('password')).toBe('wrongpassword');
      expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid credentials');
    });
  });
});
