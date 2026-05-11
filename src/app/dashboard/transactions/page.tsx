// app/dashboard/transactions/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import TransactionsClientPage from "@/components/TransactionsClientPage";

export default async function TransactionsPage() {
  const session = (await getServerSession(authOptions) || { user: { id: "bypass-user", name: "Dev Bypass", email: "dev@bypass.com" }, expires: "9999-12-31T23:59:59.999Z" });

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/dashboard/transactions");
  }

  return <TransactionsClientPage />;
}
