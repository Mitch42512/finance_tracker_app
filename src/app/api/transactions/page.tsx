// app/dashboard/transactions/page.tsx
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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      const res = await fetch("/api/transactions");
      const data = await res.json();
      setTransactions(data.transactions || []);
      setLoading(false);
    };

    fetchTransactions();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Your Transactions</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (transactions?.length ?? 0) === 0 ? (
        <p>No transactions found.</p>
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
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id}>
                <td>{txn.date.slice(0, 10)}</td>
                <td>{txn.account}</td>
                <td>{txn.type}</td>
                <td>{txn.category}</td>
                <td>{txn.subcategory}</td>
                <td>${txn.amount.toFixed(2)}</td>
                <td>{txn.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
