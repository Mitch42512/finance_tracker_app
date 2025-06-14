// src/app/api/uploads/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
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

  const uploads = await prisma.upload.findMany({
    where: {
      userId: user.id,
      newRows: { gt: 0 }, // Only show uploads with new transactions
    },
    orderBy: { uploadedAt: "desc" },
    select: {
      id: true,
      fileName: true,
      uploadedAt: true,
      newRows: true,
    },
  });
  

  return NextResponse.json({ uploads });
}
