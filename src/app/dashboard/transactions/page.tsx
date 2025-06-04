// app/dashboard/transactions/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import TransactionsClientPage from "@/components/TransactionsClientPage";

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/dashboard/transactions");
  }

  return <TransactionsClientPage />;
}
