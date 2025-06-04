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

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    include: { subcategories: true },
  });

  return NextResponse.json({
    full: categories.map((cat: { id: string; name: string; subcategories: { id: string; name: string }[] }) => ({ 
      id: cat.id,
      name: cat.name,
      subcategories: cat.subcategories.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })),
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const category = await prisma.category.create({
    data: {
      name,
      userId: user.id,
    },
  });

  return NextResponse.json({
    category: {
      id: category.id,
      name: category.name,
      subcategories: [],
    },
  });
}
