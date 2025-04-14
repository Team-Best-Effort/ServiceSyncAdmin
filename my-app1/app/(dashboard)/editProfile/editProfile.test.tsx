import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import EditProfilePage from './page';
import { SessionProvider } from 'next-auth/react';

// ✅ MOCK firebase/app
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

// ✅ MOCK firebase/auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ app: { name: '[DEFAULT]' } })),
}));

// ✅ MOCK firebase/database
vi.mock('firebase/database', () => ({
  ref: vi.fn(() => ({})),
  get: vi.fn(() => Promise.resolve({ exists: () => false })),
  update: vi.fn(() => Promise.resolve()),
  query: vi.fn(),
  orderByChild: vi.fn(),
  equalTo: vi.fn(),
  getDatabase: vi.fn(() => ({})),
}));

const mockSession = {
  user: {
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://old-image.com/profile.png',
  },
  expires: '2099-12-31T23:59:59.999Z',
};

describe('EditProfilePage - Profile Image Update', () => {
  it('updates the avatar image when the image URL is changed', async () => {
    render(
      <SessionProvider session={mockSession as any}>
        <EditProfilePage />
      </SessionProvider>
    );

    // Wait for initial avatar to load
    const avatar = await screen.findByRole('img');
    expect(avatar).toHaveAttribute('src', 'https://old-image.com/profile.png');

    // Change the image input
    const imageInput = screen.getByLabelText(/profile image url/i);
    fireEvent.change(imageInput, {
      target: { value: 'https://new-image.com/new-avatar.png' },
    });

    // Avatar should update
    await waitFor(() => {
      expect(avatar).toHaveAttribute('src', 'https://new-image.com/new-avatar.png');
    });
  });
});
