"use client";

import { SessionProvider } from "next-auth/react";
import "./globals.css";
import NavBar from "@/components/NavBar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <NavBar />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
