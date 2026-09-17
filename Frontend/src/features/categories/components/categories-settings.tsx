"use client";

import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  OriginModal,
  originFromElement,
  type OriginRect,
} from "@/components/origin-modal";
import { SegmentedControl } from "@/components/segmented-control";
import { useCategories } from "../hooks/use-categories";
import type { CategoryType } from "../types/category-types";
import { CategoryForm } from "./category-form";
import { CategoryList } from "./category-list";

type TabType = "expense" | "income";

const TAB_OPTIONS = [
  { value: "expense" as const, label: "Expense" },
  { value: "income" as const, label: "Income" },
];

export function CategoriesSettings() {
  const { data: categories = [], isLoading, isError, error } = useCategories();
  const [tab, setTab] = useState<TabType>("expense");
  const [editing, setEditing] = useState<CategoryType | null>(null);
  const [creating, setCreating] = useState(false);
  const [modalOrigin, setModalOrigin] = useState<OriginRect | null>(null);

  const filtered = useMemo(
    () => categories.filter((category) => category.type === tab),
    [categories, tab],
  );

  const modalOpen = creating || Boolean(editing);

  const closeModal = () => {
    setCreating(false);
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-caption font-medium tracking-wide text-muted uppercase">
            Settings
          </p>
          <h2 className="mt-1 text-h1 text-foreground">Categories</h2>
          <p className="mt-1 text-body-md text-muted">
            Organize income and expense labels for your transactions.
          </p>
        </div>
        <button
          type="button"
          onClick={(event) => {
            setModalOrigin(originFromElement(event.currentTarget));
            setEditing(null);
            setCreating(true);
          }}
          className="inline-flex h-button-md items-center justify-center gap-2 rounded-xl bg-primary px-4 text-button-md text-white transition hover:opacity-95 active:scale-[0.98]"
        >
          <Plus className="size-4" />
          Add category
        </button>
      </div>

      <SegmentedControl
        value={tab}
        options={TAB_OPTIONS}
        onChange={setTab}
        className="w-full max-w-sm"
      />

      {isLoading ? (
        <p className="py-10 text-body-md text-muted">Loading…</p>
      ) : isError ? (
        <p className="text-error">
          {error instanceof Error ? error.message : "Failed to load"}
        </p>
      ) : (
        <CategoryList
          categories={filtered}
          onEdit={(category, origin) => {
            setModalOrigin(origin);
            setCreating(false);
            setEditing(category);
          }}
        />
      )}

      <OriginModal
        open={modalOpen}
        origin={modalOrigin}
        onClose={closeModal}
        className="max-w-md"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-h3 text-foreground">
            {editing ? "Edit category" : "New category"}
          </h3>
          <button
            type="button"
            onClick={closeModal}
            className="inline-flex size-9 items-center justify-center rounded-xl bg-background text-muted transition hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <CategoryForm
          category={editing}
          defaultType={tab}
          onDone={closeModal}
        />
      </OriginModal>
    </div>
  );
}
