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

  if (session) {
    // If we are already logged in, redirect to the users dashboard
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1">
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
