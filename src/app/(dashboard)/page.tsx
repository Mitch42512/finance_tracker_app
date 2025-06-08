import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/");
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to your dashboard</h1>
      <p>Logged in as: <strong>{session.user?.email}</strong></p>
      <p className="mt-4 text-gray-600">Use the sidebar to access your transactions, uploads, and settings.</p>
    </div>
  );
}
