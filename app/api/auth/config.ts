import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/app/db/prisma";
import bcrypt from "bcrypt";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)
  throw new Error("Unable to Fetch client id's");

const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "sharad" },
        email: {
          label: "email",
          type: "text",
          placeholder: "sharad@gmail.com",
        },
        password: { label: "Password", type: "password" },
        type: { label: "type", type: "text" },
      },
      async authorize(credentials, req) {
        try {
          console.log("calling1");
          const exisitingUser = await prisma.user.findUnique({
            where: {
              email: credentials?.email,
            },
          });

          if (exisitingUser) {
            const isPasswordCorrect = bcrypt.compare(
              credentials?.password || "",
              exisitingUser?.password || ""
            );
            if (!isPasswordCorrect) return null;
            console.log("existing user: ", exisitingUser);
            return exisitingUser;
          } else {
            const user = await prisma.user.create({
              data: {
                username: credentials?.username || "",
                email: credentials?.email || "",
                password: await bcrypt.hash(credentials?.password || "", 10),
                provider: "USERC",
              },
            });

            return user ? user : null;
          }
        } catch (error) {
          console.log(error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile, email, credentials }: any) {
      try {
        const exisitingUser = await prisma.user.findUnique({
          where: {
            email: user?.email,
          },
        });

        if(exisitingUser?.email) return true;
      
        console.log(user);
        await prisma.user.create({
          data: {
            username: user.name,
            imageUrl: user.image,
            email: user.email,
            provider: user.type || "GOOGlE",
          },
        });
        return true;
      } catch (error) {
        return false;
      }
    },
  },
  async jwt({ token, user, account, profile, isNewUser }: any) {
    return token;
  },
  async session({ session, token, user }: any) {
    return session;
  },
  async redirect({ url, baseUrl }: any) {
    return baseUrl;
  },
  secret: "sharad",
};

export default authConfig;
