"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/radix/tabs";
import {
  OriginModal,
  originFromElement,
  type OriginRect,
} from "@/components/origin-modal";
import { Pagination } from "@/components/pagination";
import { TableSkeleton } from "@/components/table-skeleton";
import { useCategories } from "../hooks/use-categories";
import type { CategoryType, CategoryTypeEnum } from "../types/category-types";
import { CategoryForm } from "./category-form";
import { CategoryList } from "./category-list";

const PAGE_SIZE = 10;

export function CategoriesSettings() {
  const [tab, setTab] = useState<CategoryTypeEnum>("expense");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<CategoryType | null>(null);
  const [creating, setCreating] = useState(false);
  const [modalOrigin, setModalOrigin] = useState<OriginRect | null>(null);
  const [celebrateId, setCelebrateId] = useState<string | null>(null);

  const { data, isLoading, isFetching, isError, error } = useCategories({
    page,
    limit: PAGE_SIZE,
    type: tab,
  });

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

      <Tabs
        value={tab}
        onValueChange={(value: string) => {
          setTab(value as CategoryTypeEnum);
          setPage(1);
        }}
        className="gap-4"
      >
        <TabsList className="h-11 w-full max-w-sm rounded-lg p-1">
          <TabsTrigger value="expense" className="rounded-md">
            Expense
          </TabsTrigger>
          <TabsTrigger value="income" className="rounded-md">
            Income
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <TableSkeleton columns={3} rows={5} />
      ) : isError ? (
        <p className="text-error">
          {error instanceof Error ? error.message : "Failed to load"}
        </p>
      ) : (
        <div className={isFetching ? "opacity-70 transition-opacity" : undefined}>
          <CategoryList
            categories={data?.items ?? []}
            celebrateId={celebrateId}
            onCelebrateComplete={() => setCelebrateId(null)}
            onEdit={(category, origin) => {
              setModalOrigin(origin);
              setCreating(false);
              setEditing(category);
            }}
          />
          {data ? (
            <div className="mt-4">
              <Pagination
                meta={data}
                onPageChange={setPage}
                disabled={isFetching}
              />
            </div>
          ) : null}
        </div>
      )}

      <OriginModal
        open={modalOpen}
        origin={modalOrigin}
        onClose={closeModal}
        className="max-w-md"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-h4 text-foreground">
            {editing ? "Edit category" : "New category"}
          </h3>
          <button
            type="button"
            onClick={closeModal}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-secondary text-foreground transition hover:bg-background"
            aria-label="Close"
          >
            <X className="size-4 stroke-[2.25]" />
          </button>
        </div>
        <CategoryForm
          category={editing}
          defaultType={tab}
          onDone={closeModal}
          onCreated={(category) => {
            if (category.type !== tab) setTab(category.type);
            setPage(1);
            setCelebrateId(category.id);
          }}
        />
      </OriginModal>
    </div>
  );
}
