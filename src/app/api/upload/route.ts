// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { parse } from "papaparse";
import streamifier from "streamifier";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type ParsedRow = {
  date: string;
  account: string;
  type: string;
  category?: string;
  subcategory?: string;
  notes?: string;
  amount: string;
  "unique id": string;
  "linked transaction id"?: string;
};

export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (file.type !== "text/csv") {
      return NextResponse.json({ error: "Invalid file type. Please upload a CSV." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsedRows: ParsedRow[] = [];

    await new Promise<void>((resolve, reject) => {
      const stream = streamifier.createReadStream(buffer);

      parse<ParsedRow>(stream, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase(),
        step: (row) => parsedRows.push(row.data),
        complete: () => resolve(),
        error: (err) => reject(err),
      });
    });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { transactions: true },
    });

    console.log("🧠 Uploading as user ID:", user?.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add this after retrieving the user
    const existingCategories = await prisma.category.findMany({
      where: { userId: user.id },
      select: { name: true },
    });
    const existingSubcategories = await prisma.subcategory.findMany({
      where: { userId: user.id },
      select: { name: true },
    });

    const knownCategories = new Set(existingCategories.map((c: { name: string }) => c.name.toLowerCase()));
    const knownSubcategories = new Set(existingSubcategories.map((s: { name: string }) => s.name.toLowerCase()));

    const newCategorySuggestions = new Set<string>();
    const newSubcategorySuggestions = new Set<string>();

    // Build keyword map from existing notes
    const keywordMap = new Map<string, { category: string; subcategory: string }>();
    user.transactions.forEach((txn: { notes: string; category: string; subcategory: string }) => {
      if (txn.notes && txn.category && txn.subcategory) {
        const words = txn.notes.toLowerCase().split(/\s+/);
        words.forEach((word: string) => {
          if (!keywordMap.has(word)) {
            keywordMap.set(word, { category: txn.category!, subcategory: txn.subcategory! });
          }
        });
      }
    });

    const upload = await prisma.upload.create({
      data: {
        fileName: file.name,
        userId: user.id,
        uploadedAt: new Date(),
        newRows: 0,
      },
    });

    let newRows = 0;
    const skippedRows: string[] = [];
    const parsedTransactions = [];

    for (const row of parsedRows) {
      // Check for new categories/subcategories
      if (row.category && !knownCategories.has(row.category.toLowerCase())) {
        newCategorySuggestions.add(row.category);
      }
      if (row.subcategory && !knownSubcategories.has(row.subcategory.toLowerCase())) {
        newSubcategorySuggestions.add(row.subcategory);
      }

      const uniqueId = row["unique id"];

      if (!row.date || !row.amount || !uniqueId) {
        skippedRows.push(uniqueId || "missing-id");
        continue;
      }

      const exists = await prisma.transaction.findUnique({
        where: { uniqueId },
      });

      if (exists) {
        console.log("⚠️ Skipping duplicate:", uniqueId);
        skippedRows.push(uniqueId);
        continue;
      }

      console.log("✅ Creating transaction:", uniqueId);
      // Auto-suggestion logic
      let category = row.category || "";
      let subcategory = row.subcategory || "";
      let autoSuggested = false;

      if (!category && row.notes) {
        const noteWords = row.notes.toLowerCase().split(/\s+/);
        for (const word of noteWords) {
          if (keywordMap.has(word)) {
            const match = keywordMap.get(word)!;
            category = match.category;
            subcategory = match.subcategory;
            autoSuggested = true;
            break;
          }
        }
      }

      await prisma.transaction.create({
        data: {
          date: new Date(row.date),
          account: row.account,
          type: row.type,
          category: category || null,
          subcategory: subcategory || null,
          notes: row.notes || null,
          amount: parseFloat(row.amount),
          uniqueId,
          linkedTransactionId: row["linked transaction id"] || null,
          userId: user.id,
          uploadId: upload.id,
        },
      });

      console.log(`✅ Saved transaction ${uniqueId} for user ${user.id}`);

      parsedTransactions.push({
        id: uniqueId,
        date: row["date"],
        account: row["account"],
        type: row["type"],
        category,
        subcategory,
        amount: parseFloat(row["amount"]),
        notes: row["notes"] || "",
        autoSuggested, // ⬅️ flag for client
      });

      newRows++;
    }
    // After all rows have been processed, update the upload record
      await prisma.upload.update({
        where: { id: upload.id },
        data: { newRows },
      });
  
      // ✅ Final response — REPLACE your old return block with this one
      return NextResponse.json({
        success: true,
        total: parsedRows.length,
        added: newRows,
        skipped: skippedRows.length,
        skippedIds: skippedRows,
        parsedTransactions,
        newCategorySuggestions: Array.from(newCategorySuggestions),
        newSubcategorySuggestions: Array.from(newSubcategorySuggestions),
      });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
};
