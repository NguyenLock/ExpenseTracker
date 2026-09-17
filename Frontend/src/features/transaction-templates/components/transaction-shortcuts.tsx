"use client";

import { Pencil, Plus, Trash2, X, Zap } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  OriginModal,
  originFromElement,
  type OriginRect,
} from "@/components/origin-modal";
import type {
  TransactionType,
  TransactionTypeEnum,
} from "@/features/transactions/types/transaction-types";
import { cn } from "@/lib/utils";
import { useDeleteTransactionTemplate } from "../hooks/use-transaction-template-mutations";
import { useTransactionTemplates } from "../hooks/use-transaction-templates";
import type { TransactionTemplateType } from "../types/transaction-template-types";
import { ShortcutQuickAdd } from "./shortcut-quick-add";
import { TransactionTemplateForm } from "./transaction-template-form";

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

type TransactionShortcutsProps = {
  typeFilter?: TransactionTypeEnum;
  onQuickCreated?: (transaction: TransactionType) => void;
};

export function TransactionShortcuts({
  typeFilter,
  onQuickCreated,
}: TransactionShortcutsProps) {
  const { data: templates = [], isLoading } = useTransactionTemplates();
  const deleteMutation = useDeleteTransactionTemplate();

  const visibleTemplates = typeFilter
    ? templates.filter((template) => template.type === typeFilter)
    : templates;

  const [manageOpen, setManageOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<TransactionTemplateType | null>(null);
  const [quickTemplate, setQuickTemplate] =
    useState<TransactionTemplateType | null>(null);
  const [modalOrigin, setModalOrigin] = useState<OriginRect | null>(null);
  const [pendingDelete, setPendingDelete] =
    useState<TransactionTemplateType | null>(null);
  const [deleteOrigin, setDeleteOrigin] = useState<OriginRect | null>(null);

  const formOpen = creating || Boolean(editing);

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  return (
    <section className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-black/[0.04]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Zap className="size-3.5" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Shortcuts</p>
            <p className="text-caption text-muted-foreground">
              Tap → pick date → add · customize your own
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={(event) => {
            setModalOrigin(originFromElement(event.currentTarget));
            setManageOpen(true);
          }}
          className="text-sm font-medium text-primary transition hover:opacity-90"
        >
          Manage
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {isLoading ? (
          <p className="text-caption text-muted-foreground">Loading…</p>
        ) : visibleTemplates.length === 0 ? (
          <p className="text-caption text-muted-foreground">
            {typeFilter
              ? `No ${typeFilter} shortcuts yet.`
              : "No shortcuts yet."}{" "}
            <button
              type="button"
              onClick={(event) => {
                setModalOrigin(originFromElement(event.currentTarget));
                setManageOpen(true);
                setCreating(true);
              }}
              className="font-medium text-primary hover:opacity-90"
            >
              Add one
            </button>
          </p>
        ) : (
          visibleTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={(event) => {
                setModalOrigin(originFromElement(event.currentTarget));
                setQuickTemplate(template);
              }}
              className={cn(
                "inline-flex h-9 max-w-full items-center gap-2 rounded-full border border-border bg-background px-3 text-sm text-foreground transition",
                "hover:border-primary/30 hover:bg-primary/5 active:scale-[0.98]",
              )}
            >
              <span className="truncate font-medium">{template.label}</span>
              <span
                className={cn(
                  "shrink-0 text-caption font-medium",
                  template.type === "expense" ? "text-danger" : "text-success",
                )}
              >
                {template.type === "expense" ? "−" : "+"}
                {formatMoney(template.amount)}
              </span>
            </button>
          ))
        )}
      </div>

      <OriginModal
        open={Boolean(quickTemplate)}
        origin={modalOrigin}
        onClose={() => setQuickTemplate(null)}
        className="max-w-sm"
      >
        {quickTemplate ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-h4 text-foreground">Quick add</h3>
              <button
                type="button"
                onClick={() => setQuickTemplate(null)}
                className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-secondary text-foreground"
                aria-label="Close"
              >
                <X className="size-4 stroke-[2.25]" />
              </button>
            </div>
            <ShortcutQuickAdd
              template={quickTemplate}
              onCancel={() => setQuickTemplate(null)}
              onCreated={(created) => {
                setQuickTemplate(null);
                onQuickCreated?.(created);
              }}
            />
          </>
        ) : null}
      </OriginModal>

      <OriginModal
        open={manageOpen}
        origin={modalOrigin}
        onClose={() => {
          setManageOpen(false);
          closeForm();
        }}
        className="max-w-md"
      >
        {formOpen ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-h4 text-foreground">
                {editing ? "Edit shortcut" : "New shortcut"}
              </h3>
              <button
                type="button"
                onClick={closeForm}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Back
              </button>
            </div>
            <TransactionTemplateForm
              template={editing}
              defaultType={typeFilter}
              onDone={() => {
                closeForm();
              }}
            />
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-h4 text-foreground">Your shortcuts</h3>
                <p className="mt-0.5 text-caption text-muted-foreground">
                  Coffee, salary, bonus — save once, tap forever
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setCreating(true);
                }}
                className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-3 text-xs font-medium text-white"
              >
                <Plus className="size-3.5" />
                Add
              </button>
            </div>

            {templates.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
                <p className="text-sm text-foreground">No shortcuts yet</p>
                <p className="mt-1 text-caption text-muted-foreground">
                  Create one for café, lunch, or monthly salary.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border rounded-xl ring-1 ring-border">
                {templates.map((template) => (
                  <li
                    key={template.id}
                    className="flex items-center gap-3 px-3 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {template.label}
                      </p>
                      <p className="truncate text-caption text-muted-foreground">
                        {template.categoryName ?? "Category"} ·{" "}
                        {template.walletName ?? "Wallet"} ·{" "}
                        {formatMoney(template.amount)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditing(template)}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-background hover:text-foreground"
                      aria-label={`Edit ${template.label}`}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        setDeleteOrigin(
                          originFromElement(event.currentTarget),
                        );
                        setPendingDelete(template);
                      }}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-danger/10 hover:text-danger"
                      aria-label={`Delete ${template.label}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </OriginModal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        origin={deleteOrigin}
        title="Delete shortcut?"
        description={
          pendingDelete ? (
            <>“{pendingDelete.label}” will be removed from your shortcuts.</>
          ) : null
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await deleteMutation.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
