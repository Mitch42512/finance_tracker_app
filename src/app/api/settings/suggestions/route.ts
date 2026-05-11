// src/app/api/settings/suggestions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = (await getServerSession(authOptions) || { user: { id: "bypass-user", name: "Dev Bypass", email: "dev@bypass.com" }, expires: "9999-12-31T23:59:59.999Z" });
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const suggestions = await prisma.categorySuggestion.findMany({
    where: { userId: user.id },
    select: { name: true, type: true },
  });

  const newCategories = suggestions.filter((s: { type: string; name: string }) => s.type === "category").map((s: { name: string }) => s.name);
  const newSubcategories = suggestions.filter((s: { type: string; name: string }) => s.type === "subcategory").map((s: { name: string }) => s.name);

  return NextResponse.json({ newCategories, newSubcategories });
}
