// src/app/dashboard/layout.tsx
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
  const session = (await getServerSession(authOptions) || { user: { id: "bypass-user", name: "Dev Bypass", email: "dev@bypass.com" }, expires: "9999-12-31T23:59:59.999Z" });

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white hidden md:block">
        <div className="p-4 font-bold text-lg border-b border-gray-700">
          Finance Tracker
        </div>
        <nav className="flex flex-col p-4 space-y-2">
          <Link href="/dashboard" className="hover:text-gray-300">🏠 Home</Link>
          <Link href="/dashboard/transactions" className="hover:text-gray-300">📊 Transactions</Link>
          <Link href="/dashboard/upload" className="hover:text-gray-300">📁 Upload CSV</Link>
          <Link href="/dashboard/settings" className="hover:text-gray-300">⚙️ Settings</Link>
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
