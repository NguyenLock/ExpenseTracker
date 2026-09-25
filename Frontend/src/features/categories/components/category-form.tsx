"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/radix/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  onCreated?: (category: CategoryType) => void;
};

export function CategoryForm({
  category,
  defaultType = "expense",
  onDone,
  onCreated,
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
      onSuccess: (created) => {
        onCreated?.(created);
        onDone?.();
      },
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <CategoryIconBadge icon={selectedIcon} size="lg" />
          <div>
            <p className="text-label-md text-foreground">Icon</p>
            <p className="text-caption text-muted">Choose one below</p>
          </div>
        </div>
        <Controller
          control={control}
          name="icon"
          render={({ field }) => (
            <div className="grid grid-cols-6 gap-1.5 rounded-lg border border-border bg-background p-2">
              {CATEGORY_ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => field.onChange(icon)}
                  className={cn(
                    "rounded-md p-1 transition-colors",
                    field.value === icon
                      ? "bg-primary/10 ring-1 ring-primary"
                      : "hover:bg-surface",
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
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-label-md text-foreground">
          Name
        </label>
        <Input
          id="name"
          className="h-10"
          placeholder="e.g. Food & Drink"
          {...register("name")}
        />
        {errors.name ? <p className="text-error">{errors.name.message}</p> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-label-md text-foreground">Type</span>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Tabs
              value={field.value}
              onValueChange={field.onChange}
              className="gap-0"
            >
              <TabsList className="h-9 w-full rounded-lg">
                <TabsTrigger value="expense" className="rounded-md capitalize">
                  expense
                </TabsTrigger>
                <TabsTrigger value="income" className="rounded-md capitalize">
                  income
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        />
      </div>

      {errorMessage ? <p className="text-error">{errorMessage}</p> : null}

      <div className="mt-1 flex gap-2 border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          className="h-10 flex-1"
          onClick={onDone}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="h-10 flex-1"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving…" : isEditing ? "Save" : "Create"}
        </Button>
      </div>
    </form>
  );
}
