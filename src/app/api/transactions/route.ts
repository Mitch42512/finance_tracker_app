import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch all transactions for the logged-in user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { transactions: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ transactions: user.transactions });
}

// POST: Update category/subcategory for existing transactions
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { transactions: true }
  });

  console.log("📥 Fetching transactions for user ID:", user?.id);
  console.log("📦 Transactions found:", user?.transactions.length);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const { transactions } = body;

  if (!Array.isArray(transactions)) {
    return NextResponse.json({ error: "Invalid request format." }, { status: 400 });
  }

  const results = [];

  for (const txn of transactions) {
    try {
      const existing = await prisma.transaction.findUnique({
        where: { uniqueId: txn.id },
      });

      if (existing) {
        await prisma.transaction.update({
          where: { uniqueId: txn.id },
          data: {
            category: txn.category,
            subcategory: txn.subcategory,
          },
        });
        results.push({ id: txn.id, status: "updated" });
      }
    } catch (err) {
      console.error("Failed to update transaction:", txn.id, err);
      results.push({ id: txn.id, status: "error" });
    }
  }

  return NextResponse.json({ success: true, results });
}