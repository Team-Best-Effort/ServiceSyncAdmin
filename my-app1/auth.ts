import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { Provider } from 'next-auth/providers';
import { initializeApp } from 'firebase/app';
import { ref, query, getDatabase, orderByChild, equalTo, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

async function findAuthEntry(email: string, password: string): Promise<boolean> {
  try {
      // Create a reference to the Authentication node
      const authRef = ref(db, 'Authentication');
      
      // Query where the 'email' child property equals the provided email
      const authQuery = query(
          authRef,
          orderByChild('email'),    // Use the property name "email", not the email value
          equalTo(email)            // Match the email value
      );

      // Execute the query
      const snapshot = await get(authQuery);

      if (snapshot.exists()) {
          // Check if any returned entry has a matching password
          const data = snapshot.val();
          const users = Object.values(data); // Convert to array of user objects
          for (const user of users) {
              if ((user as any).password === password) { // Type assertion; refine as needed
                  return true;
              }
          }
          return false; // Email found but password didn't match
      } else {
          return false; // No matching email found
      }
  } catch (error) {
      console.error('Error querying database:', error);
      throw error;
  }
}



const providers: Provider[] = [
  Credentials({
      credentials: {
          email: { label: 'Email Address', type: 'email' },
          password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
              return null;
          }

          const result = await findAuthEntry(
              String(credentials.email),
              String(credentials.password)
          );

          if (!result) {
              return null;
          }

          return {
              id: 'test', // Replace with a unique ID from your database if possible
              name: 'Test User',
              email: String(credentials.email),
          };
      },
  }),
];




export const providerMap = providers.map((provider) => {
  if (typeof provider === 'function') {
    const providerData = provider();
      return { id: providerData.id, name: providerData.name };
  }
  return { id: provider.id, name: provider.name };
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  
  
      
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isPublicPage = nextUrl.pathname.startsWith('/public');

      if (isPublicPage || isLoggedIn) {
        return true;
      }

      return false; // Redirect unauthenticated users to login page
    },
  },
});
  