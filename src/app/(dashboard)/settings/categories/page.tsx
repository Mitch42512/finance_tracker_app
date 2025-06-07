"use client";

import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
};

export default function CategoriesSettingsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.full || []);
    };

    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name: newCategory }),
    });

    const data = await res.json();
    if (res.ok) {
      setCategories([...categories, data.category]);
      setNewCategory("");
    }
  };

  const handleAddSubcategory = async (categoryId: string, name: string) => {
    if (!name.trim()) return;
    const res = await fetch("/api/subcategories", {
      method: "POST",
      body: JSON.stringify({ categoryId, name }),
    });

    const data = await res.json();
    if (res.ok) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? { ...cat, subcategories: [...cat.subcategories, data.subcategory] }
            : cat
        )
      );
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Manage Categories</h2>

      <div className="mb-6">
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name"
          className="border px-3 py-1 mr-2"
        />
        <button
          onClick={handleAddCategory}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Add Category
        </button>
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="mb-6">
          <h3 className="font-semibold">{cat.name}</h3>
          <ul className="ml-4 list-disc text-sm">
            {cat.subcategories.map((sub) => (
              <li key={sub.id}>{sub.name}</li>
            ))}
          </ul>
          <SubcategoryInput
            onAdd={(name) => handleAddSubcategory(cat.id, name)}
          />
        </div>
      ))}
    </div>
  );
}

function SubcategoryInput({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState("");

  const handleAdd = () => {
    onAdd(name);
    setName("");
  };

  return (
    <div className="mt-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New subcategory"
        className="border px-2 py-1 text-sm mr-2"
      />
      <button
        onClick={handleAdd}
        className="bg-gray-700 text-white text-sm px-3 py-1 rounded hover:bg-black"
      >
        Add Subcategory
      </button>
    </div>
  );
}
