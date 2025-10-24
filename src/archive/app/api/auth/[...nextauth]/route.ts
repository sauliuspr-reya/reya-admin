import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // This is where you need to retrieve user data 
        // to verify with credentials
        // Docs: https://next-auth.js.org/configuration/providers/credentials
        if (credentials?.username === process.env.AUTH_USERNAME && 
            credentials?.password === process.env.AUTH_PASSWORD) {
          console.log("Credentials MATCHED!");
          return {
            id: "1",
            name: credentials.username,
            email: `${credentials.username}@example.com`,
          }
        }
        console.log("Credentials DID NOT MATCH or were invalid.");
        return null
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user }
    },
    async session({ session, token }) {
      session.user = token as any
      return session
    }
  }
})

export { handler as GET, handler as POST }
