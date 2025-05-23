import "./globals.css";
import AppSessionProvider from "./appSessionProvider";
import toast, { Toaster } from 'react-hot-toast';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body>
        <Toaster />
        <AppSessionProvider>
          {children}
        </AppSessionProvider>
      </body>
    </html>
  );
}