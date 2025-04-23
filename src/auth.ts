import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db/drizzle" // Import db instance from drizzle.ts
import { accounts, sessions, users, authenticators } from "@/db/schema" // Import tables from schema.ts
// Import the specific Neon DB type if needed for explicit typing, though often inferred
import { NeonHttpDatabase } from "drizzle-orm/neon-http"
import * as schema from "@/db/schema" // Import the full schema for type inference

// Define the correct type for the Neon HTTP database instance
// This matches the type exported from db/drizzle.ts
type NeonDB = NeonHttpDatabase<typeof schema>

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Use the Drizzle adapter, passing the db instance and table definitions
  // Cast 'db' to the correct NeonDB type.
  // The adapter is designed to work with various Drizzle drivers.
  adapter: DrizzleAdapter(db as NeonDB, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    authenticatorsTable: authenticators,
  }),
  providers: [
    // Configure the Google OAuth provider
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // Customize the profile data mapping if necessary
      profile(profile) {
        return {
          // Standard fields expected by NextAuth
          id: profile.sub, // Google's unique ID for the user
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          // Add any other custom fields you might need from the profile
        }
      },
    }),
    // Add other providers here if needed (e.g., GitHub, Email)
  ],
  session: {
    // Use database sessions instead of JWTs for session storage
    strategy: "database",
  },
  callbacks: {
    /**
     * Modify the session object before it's returned.
     * Here, we add the user's database ID to the session.
     */
    async session({ session, user }) {
      // Ensure session.user exists before assigning properties
      if (session.user) {
        session.user.id = user.id // Add the user's DB id to the session object
      }
      return session // Return the modified session
    },
    // Add other callbacks if needed (e.g., jwt, signIn, redirect)
  },
  // Add any other NextAuth configuration options here
  // pages: { signIn: '/auth/signin' }, // Custom sign-in page
  // debug: process.env.NODE_ENV === 'development', // Enable debug logs in development
})
