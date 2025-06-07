"use client";

import { useEffect, useState } from "react";
import TransactionReviewTable from "@/components/TransactionReviewTable";
import { Transaction } from "@/types/transaction";

type UploadHistory = {
  id: string;
  fileName: string;
  uploadedAt: string;
  newRows: number;
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [status, setStatus] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([]);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
        setSubcategories(data.subcategories || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    fetchCategoryData();
  }, []);

  useEffect(() => {
    const fetchUploadHistory = async () => {
      try {
        const res = await fetch("/api/upload/history");
        const data = await res.json();
        if (res.ok) {
        setUploadHistory(data.uploads || []);
      }
      } catch (err) {
        console.error("Failed to fetch upload history:", err);
      }
    };

  fetchUploadHistory();
  }, []);


  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      setStatus("No file selected.");
      return;
    }

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
        setTransactions(data.parsedTransactions);
        setStatus(`Upload successful: ${data.added} new transactions added, ${data.skipped} skipped.`);
      } else {
        setStatus("Upload failed: " + data.error);
      }
    } catch (err) {
      console.error("Upload error", err);
      setStatus("Upload failed.");
    }
  };

  const handleSave = async (editedTransactions: Transaction[]) => {
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: editedTransactions }),
      });

      const result = await response.json();
      if (result.success) {
        setStatus(`Saved ${result.results.length} transactions.`);
        setTransactions([]); // clear
      } else {
        setStatus("Failed to save transactions.");
      }
    } catch (err) {
      console.error("Save error:", err);
      setStatus("An error occurred while saving.");
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Upload Transactions</h2>

      <form onSubmit={handleUpload} className="flex flex-col gap-4 mb-6">
        <label
          htmlFor="csvUpload"
          className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm w-fit"
        >
          Choose CSV File
        </label>
        <input
          id="csvUpload"
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />
        {file && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>Selected: {file.name}</span>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        <button
          type="submit"
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Upload CSV
        </button>
        {status && <p className="text-sm text-gray-600">{status}</p>}
      </form>

      {transactions.length > 0 && (
        <>
          <h3 className="text-lg font-medium mb-2">Review Transactions</h3>
          <TransactionReviewTable
            transactions={transactions}
            onSave={handleSave}
            categories={categories}
            subcategories={subcategories}
          />
        </>
      )}

      <div className="mt-8 border-t pt-6">
        <h3 className="text-md font-semibold mb-2">Need help?</h3>
        <p className="text-sm text-gray-600 mb-2">
          Please upload a <strong>.csv</strong> file matching the required format. You can view an example below or download the template:
        </p>

        <img
          src="/CSV_Example.png"
          alt="Sample CSV Upload Format"
          className="border w-full max-w-2xl rounded mb-4"
        />

        <a
          href="/ImportCSV_Example.xlsx"
          download
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          Download Upload Template (.xlsx)
        </a>
      </div>
        {uploadHistory.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-md font-semibold mb-2">Upload History</h3>
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-2 py-1">Date</th>
                  <th className="text-left px-2 py-1">File Name</th>
                  <th className="text-left px-2 py-1">New Transactions</th>
                </tr>
              </thead>
              <tbody>
                {uploadHistory.map((upload) => (
                  <tr key={upload.id} className="border-t">
                    <td className="px-2 py-1">{new Date(upload.uploadedAt).toLocaleString()}</td>
                    <td className="px-2 py-1">{upload.fileName}</td>
                    <td className="px-2 py-1">{upload.newRows}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div> 
  );
}
