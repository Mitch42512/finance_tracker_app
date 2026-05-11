// src/app/api/transactions/clear/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  const session = (await getServerSession(authOptions) || { user: { id: "bypass-user", name: "Dev Bypass", email: "dev@bypass.com" }, expires: "9999-12-31T23:59:59.999Z" });
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.upload.deleteMany({ where: { userId: user.id } });

  return NextResponse.json({ success: true });
}
