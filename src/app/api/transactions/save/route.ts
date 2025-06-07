// src/app/api/transactions/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
  }

  let added = 0;
  const skipped: string[] = [];

  for (const row of body) {
    if (!row.id || !row.date || !row.amount) {
      skipped.push(row.id ?? "missing-id");
      continue;
    }

    const exists = await prisma.transaction.findUnique({
      where: { uniqueId: row.id },
    });

    if (exists) {
      skipped.push(row.id);
      continue;
    }

    const category = row.category?.trim();
    const subcategory = row.subcategory?.trim();

    // Upsert category if provided
    if (category) {
      await prisma.category.upsert({
        where: {
          userId_name: {
            userId: user.id,
            name: category,
          },
        },
        update: {},
        create: {
          userId: user.id,
          name: category,
        },
      });
    }

    // Upsert subcategory if provided and category exists
    if (subcategory && category) {
      const parent = await prisma.category.findUnique({
        where: {
          userId_name: {
            userId: user.id,
            name: category,
          },
        },
      });

      if (parent) {
        await prisma.subcategory.upsert({
          where: {
            userId_name: {
              userId: user.id,
              name: subcategory,
            },
          },
          update: {},
          create: {
            userId: user.id,
            name: subcategory,
            categoryId: parent.id,
          },
        });
      }
    }

    await prisma.transaction.create({
      data: {
        date: new Date(row.date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        account: row.account,
        type: row.type,
        category: category || null,
        subcategory: subcategory || null,
        notes: row.notes || null,
        amount: parseFloat(row.amount),
        uniqueId: row.id,
        userId: user.id,
      },
    });

    added++;
  }

  return NextResponse.json({
    success: true,
    added,
    skipped: skipped.length,
    skippedIds: skipped,
  });
}
