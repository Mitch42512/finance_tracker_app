"use client";

import { useState } from "react";

type Transaction = {
  id: string;
  date: string;
  account: string;
  type: string;
  category: string;
  subcategory: string;
  amount: number;
  notes: string;
};

type Props = {
  onParsed: (transactions: Transaction[]) => void;
};

export default function UploadForm({ onParsed }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setStatus("Uploading...");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        const transactions: Transaction[] = data.parsedTransactions || []; // Update this to match what you return
        setStatus(`Uploaded successfully: ${transactions.length} transactions parsed.`);
        onParsed(transactions);
      } else {
        setStatus("Error: " + data.error);
      }
    } catch (err) {
      setStatus("Upload failed.");
    }
  };

  return (
    <form onSubmit={handleUpload} className="flex flex-col items-start gap-4">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
      >
        Upload CSV
      </button>
      {status && <p className="text-sm text-gray-700">{status}</p>}
    </form>
  );
}