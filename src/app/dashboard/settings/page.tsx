"use client";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [newCategories, setNewCategories] = useState<string[]>([]);
  const [newSubcategories, setNewSubcategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const res = await fetch("/api/settings/suggestions");
      if (res.ok) {
        const data = await res.json();
        setNewCategories(data.newCategories || []);
        setNewSubcategories(data.newSubcategories || []);
      }
    };
    fetchSuggestions();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-6">Settings</h2>

      {newCategories.length > 0 || newSubcategories.length > 0 ? (
        <div className="mb-8 p-4 bg-yellow-100 border border-yellow-400 rounded">
          <h3 className="text-md font-semibold mb-2 text-yellow-800">⚠️ New Categories Detected</h3>
          {newCategories.length > 0 && (
            <div>
              <p className="font-medium text-gray-700">New Categories:</p>
              <ul className="list-disc ml-6 text-gray-800">
                {newCategories.map((cat) => <li key={cat}>{cat}</li>)}
              </ul>
            </div>
          )}
          {newSubcategories.length > 0 && (
            <div className="mt-3">
              <p className="font-medium text-gray-700">New Subcategories:</p>
              <ul className="list-disc ml-6 text-gray-800">
                {newSubcategories.map((sub) => <li key={sub}>{sub}</li>)}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No new category suggestions.</p>
      )}

      {/* other settings content... */}
    </div>
  );
}
