"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  originFromElement,
  type OriginRect,
} from "@/components/origin-modal";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useDeleteCategory } from "../hooks/use-category-mutations";
import type { CategoryType } from "../types/category-types";
import { CategoryIconBadge } from "./category-icon-badge";

type CategoryListProps = {
  categories: CategoryType[];
  onEdit: (category: CategoryType, origin: OriginRect) => void;
};

export function CategoryList({ categories, onEdit }: CategoryListProps) {
  const deleteMutation = useDeleteCategory();
  const [pendingDelete, setPendingDelete] = useState<CategoryType | null>(null);
  const [deleteOrigin, setDeleteOrigin] = useState<OriginRect | null>(null);

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 bg-surface px-6 py-14 text-center">
        <p className="text-body-md text-muted">No categories in this tab yet.</p>
        <p className="mt-1 text-caption text-muted">
          Use “Add category” to create one.
        </p>
      </div>
    );
  }

  const errorMessage =
    deleteMutation.error instanceof ApiError
      ? deleteMutation.error.message
      : deleteMutation.error
        ? "Unable to delete category"
        : null;

  return (
    <div className="flex flex-col gap-3">
      {errorMessage ? <p className="text-error">{errorMessage}</p> : null}
      <div className="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-black/[0.04]">
        <table className="w-full text-left">
          <thead className="border-b border-black/[0.04] bg-background/60">
            <tr>
              <th className="px-4 py-3 text-table-header text-muted">Category</th>
              <th className="hidden px-4 py-3 text-table-header text-muted sm:table-cell">
                Type
              </th>
              <th className="px-4 py-3 text-right text-table-header text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr
                key={category.id}
                className="border-b border-black/[0.04] last:border-0"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <CategoryIconBadge icon={category.icon} size="sm" />
                    <span className="text-table-cell font-medium text-foreground">
                      {category.name}
                    </span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-label-sm capitalize",
                      category.type === "expense"
                        ? "bg-danger/10 text-danger"
                        : "bg-success/10 text-success",
                    )}
                  >
                    {category.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={(event) =>
                        onEdit(category, originFromElement(event.currentTarget))
                      }
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-background hover:text-foreground"
                      aria-label={`Edit ${category.name}`}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={deleteMutation.isPending}
                      onClick={(event) => {
                        setDeleteOrigin(originFromElement(event.currentTarget));
                        setPendingDelete(category);
                      }}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger disabled:opacity-60"
                      aria-label={`Delete ${category.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        origin={deleteOrigin}
        title="Delete category?"
        description={
          pendingDelete ? (
            <>
              “{pendingDelete.name}” will be removed permanently. This cannot be
              undone.
            </>
          ) : null
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        loading={deleteMutation.isPending}
        onCancel={() => {
          if (!deleteMutation.isPending) setPendingDelete(null);
        }}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteMutation.mutate(pendingDelete.id, {
            onSuccess: () => setPendingDelete(null),
          });
        }}
      />
    </div>
  );
}
