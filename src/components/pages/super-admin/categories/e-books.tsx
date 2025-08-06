"use client";

import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";
import { Eye, PenSquareIcon, Plus, Trash } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AutoForm, FormField } from "@/components/form/auto-form";
import TooltipBtn from "@/components/tooltip-btn";
import MyTable, { IColumn } from "@/components/my-table";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/components/models/queries/e-books-categories";
import { toast } from "sonner";

const EBookCategories = () => {
  const t = useTranslations();
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [editingCategory, setEditingCategory] = useState<Record<
    string,
    any
  > | null>(null);
  const [open, setOpen] = useState(false);
  const form = useForm();

  const fields = useMemo<FormField[]>(
    () => [
      {
        label: t("name"),
        name: "name",
        type: "text",
        required: true,
      },
    ],
    [t],
  );

  const columns = useMemo<IColumn[]>(
    () => [
      {
        key: "index",
        dataIndex: "index",
        title: "#",
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        key: "name",
        dataIndex: "name",
        title: t("name"),
      },
      {
        key: "actions",
        dataIndex: "actions",
        width: 200,
        title: t("actions"),
        render: (_: any, record: any) => (
          <div className="flex gap-2">
            <TooltipBtn
              variant={"secondary"}
              size={"sm"}
              title={t("Edit category")}
              onClick={() => {
                setEditingCategory(record);
                form.reset({ name: record.name });
                setOpen(true);
              }}
            >
              <PenSquareIcon />
            </TooltipBtn>
            <TooltipBtn
              variant={"destructive"}
              size={"sm"}
              color={"red"}
              title={t("Delete category")}
              onClick={() => {
                deleteCategory.mutate(record.id, {
                  onSuccess: () =>
                    toast.success(t("Category deleted successfully")),
                  onError: () => toast.error(t("Error deleting category")),
                });
              }}
            >
              <Trash />
            </TooltipBtn>
          </div>
        ),
      },
    ],
    [deleteCategory, form, t],
  );

  const onSubmit = async (data: any) => {
    if (editingCategory) {
      updateCategory.mutate(
        {
          id: editingCategory.id,
          name: data.name,
        },
        {
          onSuccess: () => {
            toast.success(t("Category updated successfully"));
            setOpen(false);
          },
        },
      );
    } else {
      createCategory.mutate(
        {
          name: data.name,
        },
        {
          onSuccess: () => {
            toast.success(t("Category created successfully"));
            setOpen(false);
          },
        },
      );
    }
  };

  return (
    <div className="cont">
      <h1 className="text-2xl font-semibold py-5">
        {t("Categories of E-Base Books")}
      </h1>

      <MyTable
        columns={columns}
        isLoading={isLoading}
        dataSource={categories?.data || []}
        searchable
        header={
          <TooltipBtn
            variant={"default"}
            title={t("Add Category")}
            onClick={() => {
              setEditingCategory(null);
              form.reset({ name: "" });
              setOpen(true);
            }}
          >
            <Plus />
            {t("Add Category")}
          </TooltipBtn>
        }
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {editingCategory ? t("Edit Category") : t("Add Category")}
            </SheetTitle>
          </SheetHeader>
          <div className="p-3">
            <AutoForm
              submitText={
                editingCategory ? t("Edit Category") : t("Add Category")
              }
              onSubmit={onSubmit}
              form={form}
              fields={fields}
              showResetButton={false}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EBookCategories;
