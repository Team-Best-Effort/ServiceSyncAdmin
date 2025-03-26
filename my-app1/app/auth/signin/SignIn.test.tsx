import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import SignIn from './page';
import React from 'react';

// Mock next-auth
vi.mock('next-auth', () => ({
  signIn: vi.fn(),
  getServerSession: vi.fn(),
}));

// Mock the signIn function from actions.ts
vi.mock('./actions', () => ({
  default: vi.fn(),
}));

// Mock providerMap
vi.mock('../auth', () => ({
  providerMap: [
    { id: 'credentials', name: 'Email and Password' },
  ],
}));

// Mock @toolpad/core components
vi.mock('@toolpad/core/SignInPage', () => ({
  SignInPage: (props) => {
    const [error, setError] = React.useState(null);
    return (
      <div data-testid="sign-in-page">
        <h2>{props.slots.title()}</h2>
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

// Mock @toolpad/core/AppProvider
vi.mock('@toolpad/core/AppProvider', () => ({
  AppProvider: (props) => <div data-testid="app-provider">{props.children}</div>,
}));

describe('SignIn', () => {
  const mockSignIn = require('./actions').default;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully logs in with valid credentials', async () => {
    // Mock a successful login
    mockSignIn.mockResolvedValueOnce({ success: true });

    render(<SignIn />);

    // Verify the page renders correctly
    expect(screen.getByText(/Sign in to ServiceSync/i)).toBeInTheDocument();
    expect(screen.getByText('Please log in with your credinetials')).toBeInTheDocument();

    // Fill in the form
    await userEvent.type(screen.getByTestId('email-input'), 'test@example.com');
    await userEvent.type(screen.getByTestId('password-input'), 'password123');

    // Submit the form
    await userEvent.click(screen.getByTestId('submit-button'));

    // Verify the signIn function was called with the correct credentials
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        'credentials',
        expect.any(FormData)
      );

      const formData = mockSignIn.mock.calls[0][1];
      expect(formData.get('email')).toBe('test@example.com');
      expect(formData.get('password')).toBe('password123');

      // Verify no error message is displayed
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  it('fails to log in with invalid credentials', async () => {
    // Mock a failed login
    mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(<SignIn />);

    // Verify the page renders correctly
    expect(screen.getByText(/Sign in to ServiceSync/i)).toBeInTheDocument();
    expect(screen.getByText('Please log in with your credinetials')).toBeInTheDocument();

    // Fill in the form with invalid credentials
    await userEvent.type(screen.getByTestId('email-input'), 'wrong@example.com');
    await userEvent.type(screen.getByTestId('password-input'), 'wrongpassword');

    // Submit the form
    await userEvent.click(screen.getByTestId('submit-button'));

    // Verify the signIn function was called with the incorrect credentials
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        'credentials',
        expect.any(FormData)
      );

      const formData = mockSignIn.mock.calls[0][1];
      expect(formData.get('email')).toBe('wrong@example.com');
      expect(formData.get('password')).toBe('wrongpassword');

      // Verify the error message is displayed
      expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid credentials');
    });
  });
});