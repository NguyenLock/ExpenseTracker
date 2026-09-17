"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { CATEGORY_ICON_OPTIONS } from "../constants/category-icons";
import {
  useCreateCategory,
  useUpdateCategory,
} from "../hooks/use-category-mutations";
import {
  categorySchema,
  type CategoryFormValues,
} from "../schemas/category-schema";
import type { CategoryType } from "../types/category-types";
import { CategoryIconBadge } from "./category-icon-badge";

type CategoryFormProps = {
  category?: CategoryType | null;
  defaultType?: "income" | "expense";
  onDone?: () => void;
};

export function CategoryForm({
  category,
  defaultType = "expense",
  onDone,
}: CategoryFormProps) {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const isEditing = Boolean(category);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      type: defaultType,
      icon: CATEGORY_ICON_OPTIONS[0],
    },
  });

  const selectedIcon = watch("icon");

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        type: category.type,
        icon: category.icon,
      });
    } else {
      reset({
        name: "",
        type: defaultType,
        icon: CATEGORY_ICON_OPTIONS[0],
      });
    }
  }, [category, defaultType, reset]);

  const mutation = isEditing ? updateMutation : createMutation;
  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Unable to save category"
        : null;

  const onSubmit = handleSubmit((values) => {
    if (category) {
      updateMutation.mutate(
        { id: category.id, data: values },
        { onSuccess: () => onDone?.() },
      );
      return;
    }

    createMutation.mutate(values, {
      onSuccess: () => onDone?.(),
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3">
        <CategoryIconBadge icon={selectedIcon} size="lg" />
        <p className="text-caption text-muted">Pick an icon</p>
      </div>

      <Controller
        control={control}
        name="icon"
        render={({ field }) => (
          <div className="grid grid-cols-6 gap-2">
            {CATEGORY_ICON_OPTIONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => field.onChange(icon)}
                className={cn(
                  "rounded-2xl p-1.5 transition-shadow",
                  field.value === icon
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-surface"
                    : "hover:bg-background",
                )}
                aria-label={icon}
              >
                <CategoryIconBadge icon={icon} size="sm" />
              </button>
            ))}
          </div>
        )}
      />
      {errors.icon ? <p className="text-error">{errors.icon.message}</p> : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-label-lg text-foreground">
          Category name
        </label>
        <input
          id="name"
          className={cn(
            "h-12 rounded-2xl border-0 bg-background px-4 text-input-value outline-none",
            "ring-1 ring-black/5 focus:ring-2 focus:ring-primary/30",
          )}
          placeholder="e.g. Food & Drink"
          {...register("name")}
        />
        {errors.name ? <p className="text-error">{errors.name.message}</p> : null}
      </div>

      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-background p-1">
            {(["expense", "income"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => field.onChange(type)}
                className={cn(
                  "h-10 rounded-xl text-label-md capitalize transition-colors",
                  field.value === type
                    ? type === "expense"
                      ? "bg-danger text-white shadow-sm"
                      : "bg-success text-white shadow-sm"
                    : "text-muted hover:text-foreground",
                )}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      />

      {errorMessage ? <p className="text-error">{errorMessage}</p> : null}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onDone}
          className="h-12 flex-1 rounded-2xl bg-background text-button-md text-foreground"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className={cn(
            "h-12 flex-[1.4] rounded-2xl bg-primary text-button-md text-white",
            "hover:opacity-95 disabled:opacity-60",
          )}
        >
          {mutation.isPending ? "Saving…" : isEditing ? "Save" : "Create"}
        </button>
      </div>
    </form>
  );
}
