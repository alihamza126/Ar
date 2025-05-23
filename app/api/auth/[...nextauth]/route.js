import NextAuth from 'next-auth';

import {authOptions} from './authOptions'
const handler = NextAuth({...authOptions, theme: {
    colorScheme: "auto",
    brandColor: "#d87b5b",
    logo: "/icons/icon.png",
    buttonText: "#d87b5b"
  }})

export { handler as GET, handler as POST }
