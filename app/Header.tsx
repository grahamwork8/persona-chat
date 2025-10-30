import Link from 'next/link';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 border-b">
<Link href="/" className="text-xl font-bold hover:underline">
  Persona Chat
</Link>

      <nav className="flex gap-4 items-center">
        <SignedOut>
          <Link href="/sign-in">Sign In</Link>
          <Link href="/sign-up">Sign Up</Link>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </nav>
    </header>
  );
}
