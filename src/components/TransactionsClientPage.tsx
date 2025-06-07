"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as Tooltip from "@radix-ui/react-tooltip";

const cellStyle = "align-middle whitespace-nowrap px-3 py-2 text-sm truncate max-w-[160px]";


import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

const columnLabels: Record<string, string> = {
  Date: "Date",
  Account: "Account",
  Type: "Type",
  Category: "Category",
  Subcategory: "Subcategory",
  Amount: "Amount",
  Actions: "", // ✅ this replaces Info + Delete
};

const defaultColumns = Object.keys(columnLabels);

function SortableColumn({ id }: { id: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="text-center text-gray-600 px-3 py-2 whitespace-nowrap text-sm align-middle"
    >
      {columnLabels[id] ?? id}
    </th>
  );  
}


export default function TransactionsClientPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [columns, setColumns] = useState<string[]>(defaultColumns);

  const sensors = useSensors(useSensor(PointerSensor));

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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = columns.indexOf(active.id);
      const newIndex = columns.indexOf(over.id);
      setColumns((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this transaction?");
    if (!confirm) return;

    const txnToDelete = transactions.find((t) => t.id === id);
    if (!txnToDelete) return;

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    const undo = () => {
      setTransactions((prev) => [txnToDelete, ...prev]);
      toast.success("Undo successful – transaction restored.");
    };

    toast((t) => (
      <span>
        Transaction deleted.
        <button
          onClick={() => {
            undo();
            toast.dismiss(t.id);
          }}
          className="ml-2 text-blue-600 underline"
        >
          Undo
        </button>
      </span>
    ), { duration: 5000 });

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Error deleting transaction.");
        undo();
      }
    } catch (err) {
      console.error("Error deleting:", err);
      toast.error("Network error.");
      undo();
    }
  };

  if (loading) return <div className="p-8">Loading transactions...</div>;

  return (
    <div>
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-4">All Transactions</h2>

        {transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full max-w-full">
              <table className="text-sm border-separate border-spacing-y-1">
                <thead>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={columns} strategy={horizontalListSortingStrategy}>
                      <tr>
                        {columns.map((col) => (
                          <SortableColumn key={col} id={col} />
                        ))}
                      </tr>
                    </SortableContext>
                  </DndContext>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="border-t border-gray-100">
                      {columns.map((col) => {
                        switch (col) {
                          case "Date":
                            return (
                              <td key="date">
                                <span className="bg-gray-100 rounded px-2 py-1 inline-block">
                                  {new Date(txn.date).toLocaleDateString("en-AU", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "2-digit",
                                  })}
                                </span>
                              </td>
                            );
                          case "Account":
                            return (
                              <td key="account" className={cellStyle}>
                                <span className="bg-gray-100 rounded px-2 py-1 inline-block">
                                  {txn.account}
                                </span>
                              </td>
                            );
                          case "Type":
                            return (
                              <td key="type" className={cellStyle}>
                                <span
                                  className={`rounded px-2 py-1 inline-block text-white ${
                                    txn.type.toLowerCase() === "income"
                                      ? "bg-green-400"
                                      : "bg-red-400"
                                  }`}
                                >
                                  {txn.type}
                                </span>
                              </td>
                            );
                          case "Category":
                            return (
                              <td key="category" className={cellStyle}>
                                <span className="bg-gray-100 rounded px-2 py-1 inline-block">
                                  {txn.category}
                                </span>
                              </td>
                            );
                          case "Subcategory":
                            return (
                              <td key="subcategory" className={cellStyle}>
                                <span className="bg-gray-100 rounded px-2 py-1 inline-block">
                                  {txn.subcategory}
                                </span>
                              </td>
                            );
                          case "Amount":
                            return (
                              <td key="amount" className={cellStyle}>
                                <span className="bg-gray-100 rounded px-2 py-1 inline-block">
                                  ${txn.amount.toFixed(2)}
                                </span>
                              </td>
                            );
                            case "Actions":
                              return (
                                <td key="actions" className="text-right align-middle px-2 min-w-[80px] space-x-2">
                                  <Tooltip.Provider delayDuration={0}>
                                    <Tooltip.Root>
                                      <Tooltip.Trigger>
                                        <button
                                        className="text-blue-500 hover"
                                        title={txn.notes || "No notes"}
                                        >
                                          ℹ️
                                        </button>
                                      </Tooltip.Trigger>
                                      <Tooltip.Content>
                                        <Tooltip.Arrow className="fill-gray-800" />
                                        <Tooltip.Content
                                          side="top"
                                          className="bg-gray-800 text-white px-2 py-1 rounded text-xs shadow"
                                        >
                                          {txn.notes || "No notes"}
                                        </Tooltip.Content>
                                      </Tooltip.Content>
                                    </Tooltip.Root>
                                  </Tooltip.Provider>
                                  <button
                                    onClick={() => handleDelete(txn.id)}
                                  >
                                    🗑️
                                  </button>
                                </td>
                              );                                                        
                          default:
                            return null;
                        }
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
          Reset Transactions
        </button>
      </div>
    </div>
  );
}
