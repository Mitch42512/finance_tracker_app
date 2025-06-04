"use client";
import React, { useState } from "react";
import { Transaction } from "@/types/transaction";

type TransactionWithSuggestion = Transaction & {
  autoSuggestedCategory?: boolean;
  autoSuggestedSubcategory?: boolean;
};

type Props = {
  transactions: TransactionWithSuggestion[];
  onSave: (transactions: Transaction[]) => void;
  categories: string[];
  subcategories: string[];
};

const TransactionReviewTable: React.FC<Props> = ({
  transactions,
  onSave,
  categories,
  subcategories,
}) => {
  const [data, setData] = useState<TransactionWithSuggestion[]>(transactions || []);

  const handleFieldChange = (
    id: string,
    field: keyof Transaction,
    value: string
  ) => {
    setData((prev) =>
      prev.map((txn) =>
        txn.id === id
          ? {
              ...txn,
              [field]: value,
              ...(field === "category" && txn.autoSuggestedCategory
                ? { autoSuggestedCategory: false }
                : {}),
              ...(field === "subcategory" && txn.autoSuggestedSubcategory
                ? { autoSuggestedSubcategory: false }
                : {}),
            }
          : txn
      )
    );
  };

  const handleRemove = (id: string) => {
    setData((prev) => prev.filter((txn) => txn.id !== id));
  };

  return (
    <div className="w-full mt-6 overflow-x-auto">
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((txn) => (
            <tr key={txn.id}>
              <td>{txn.date}</td>
              <td>{txn.account}</td>
              <td>{txn.type}</td>
              <td>
                <select
                  value={txn.category || ""}
                  onChange={(e) =>
                    handleFieldChange(txn.id, "category", e.target.value)
                  }
                  className={`border px-1 ${
                    txn.autoSuggestedCategory ? "bg-yellow-100" : ""
                  } ${!txn.category ? "border-red-400" : ""}`}
                >
                  <option value="">Select</option>
                  {[...new Set(categories)].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  value={txn.subcategory || ""}
                  onChange={(e) =>
                    handleFieldChange(txn.id, "subcategory", e.target.value)
                  }
                  className={`border px-1 ${
                    txn.autoSuggestedSubcategory ? "bg-yellow-100" : ""
                  } ${!txn.subcategory ? "border-red-400" : ""}`}
                >
                  <option value="">Select</option>
                  {[...new Set(subcategories)].map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </td>
              <td>{txn.amount}</td>
              <td>{txn.notes || ""}</td>
              <td>
                <button
                  onClick={() => handleRemove(txn.id)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={() => onSave(data)}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Save All Transactions
      </button>
    </div>
  );
};

export default TransactionReviewTable;