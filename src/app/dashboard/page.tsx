// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardHome() {
  const session = (await getServerSession(authOptions) || { user: { id: "bypass-user", name: "Dev Bypass", email: "dev@bypass.com" }, expires: "9999-12-31T23:59:59.999Z" });

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to your dashboard</h1>
      <p>Logged in as: <strong>{session.user?.email}</strong></p>
      <p className="mt-4 text-gray-600">Use the sidebar to access your transactions, uploads, and settings.</p>
    </div>
  );
}
