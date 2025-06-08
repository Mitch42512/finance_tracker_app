import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import "@/app/globals.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    // If the user is not authenticated, redirect to the login page
    redirect("/login?callbackUrl=/");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white hidden md:block">
        <div className="p-4 font-bold text-lg border-b border-gray-700">
          Finance Tracker
        </div>
        <nav className="flex flex-col p-4 space-y-2">
          <Link href="/" className="hover:text-gray-300">🏠 Home</Link>
          <Link href="/transactions" className="hover:text-gray-300">📊 Transactions</Link>
          <Link href="/upload" className="hover:text-gray-300">📁 Upload CSV</Link>
          <Link href="/settings" className="hover:text-gray-300">⚙️ Settings</Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <header className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
          <p className="text-sm text-gray-600">
            Logged in as <strong>{session.user?.email}</strong>
          </p>
          <SignOutButton />
        </header>

        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
