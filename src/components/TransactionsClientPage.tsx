"use client";

import { useEffect, useState } from "react";

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

export default function TransactionsClientPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("/api/transactions");
        const data = await res.json();
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error("Failed to load transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this transaction?");
    if (!confirm) return;
  
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
  
      if (res.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      } else {
        console.error("Failed to delete transaction.");
      }
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };
  

  if (loading) return <div className="p-8">Loading transactions...</div>;

  return (
    <div>
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-4">All Transactions</h2>

        {(transactions?.length ?? 0) === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th>Date</th>
                <th>Account</th>
                <th>Type</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Amount</th>
                <th className="text-right"> </th>
                <th className="text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id}>
                  <td>{new Date(txn.date).toLocaleDateString("en-AU", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })}</td>
                  <td>{txn.account}</td>
                  <td>{txn.type}</td>
                  <td>{txn.category}</td>
                  <td>{txn.subcategory}</td>
                  <td>${txn.amount.toFixed(2)}</td>
                  <td className="text-right">
                    <button
                      className="text-blue-500 hover:underline"
                      title={txn.notes || "No notes"}
                    >
                      ℹ️
                    </button>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => handleDelete(txn.id)}
                      className="text-red-500 hover:underline"
                      title="Delete transaction"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="p-8">
        <button
          onClick={async () => {
            const confirmed = window.confirm(
              "⚠️ Are you sure you want to delete ALL transactions and uploads? This action cannot be undone."
            );
            if (!confirmed) return;

            const res = await fetch("/api/transactions/clear", { method: "DELETE" });

            if (res.ok) {
              window.location.reload();
            } else {
              alert("Something went wrong while clearing data.");
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete All Transactions & Uploads
        </button>
      </div>
    </div>
  );
}
