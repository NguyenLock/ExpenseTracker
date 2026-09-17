"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaginatedType } from "@/types/pagination-types";

type PaginationProps = {
  meta: Pick<
    PaginatedType<unknown>,
    "page" | "totalPages" | "total" | "hasNext" | "hasPrev" | "limit"
  >;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export function Pagination({ meta, onPageChange, disabled }: PaginationProps) {
  if (meta.total === 0) return null;

  const from = (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-caption text-muted-foreground">
        Showing {from}–{to} of {meta.total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          disabled={disabled || !meta.hasPrev}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft className="size-4" />
          Prev
        </Button>
        <span className="min-w-16 text-center text-label-sm text-foreground">
          {meta.page} / {meta.totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          disabled={disabled || !meta.hasNext}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
