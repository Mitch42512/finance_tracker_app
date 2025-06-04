import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, categoryId } = body;

  if (!name || !categoryId) {
    return NextResponse.json({ error: "Name and categoryId are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const subcategory = await prisma.subcategory.create({
    data: {
      name: name.trim(),
      categoryId,
      userId: user.id,
    },
  });

  return NextResponse.json({
    subcategory: {
      id: subcategory.id,
      name: subcategory.name,
    },
  });
}
