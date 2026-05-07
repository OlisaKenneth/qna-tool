"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { SessionProvider } from "next-auth/react";

function NavBarContent() {
  const { data: session } = useSession();
  return (
    <nav className="bg-gray-800 text-white p-3 flex justify-between items-center">
      <Link href="/" className="font-bold">Q&A Tool</Link>
      <div className="space-x-4">
        <Link href="/channels">Channels</Link>
        <Link href="/search">Search</Link>
        {session ? (
          <>
            <span>Hello, {session.user?.name}</span>
            <button onClick={() => signOut()} className="bg-red-500 px-2 py-1 rounded">Logout</button>
          </>
        ) : (
          <>
            <Link href="/auth/signin">Sign In</Link>
            <Link href="/auth/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default function NavBar() {
  return (
    <SessionProvider>
      <NavBarContent />
    </SessionProvider>
  );
}
