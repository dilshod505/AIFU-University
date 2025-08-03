"use client";

import React, { useMemo, useState } from "react";
import { AutoForm, FormField } from "@/components/form/auto-form";
import MyTable, { IColumn } from "@/components/my-table";
import TooltipBtn from "@/components/tooltip-btn";
import { Eye, PenSquareIcon, Plus, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useCopiesBooks,
  useCreateCopiesBooks,
  useDeleteCopiesBooks,
  useUpdateCopiesBooks,
} from "@/components/models/queries/copies-books";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { useBaseBook } from "@/components/models/queries/base-book";
import { toast } from "sonner";

export const CopiesBooks = () => {
  const t = useTranslations();
  const { data: copiesBooks, isLoading } = useCopiesBooks();
  const createCopiesBook = useCreateCopiesBooks();
  const deleteCategory = useDeleteCopiesBooks();
  const updateBook = useUpdateCopiesBooks();

  const { data: baseBooks } = useBaseBook();

  const [editingBook, setEditingCategory] = useState<Record<
    string,
    any
  > | null>(null);
  const [open, setOpen] = useState(false);
  const form = useForm();

  const fields = useMemo<FormField[]>(
    () => [
      {
        label: t("Inventory Number"),
        name: "inventoryNumber",
        type: "text",
        required: true,
      },
      {
        label: t("Shelf Location"),
        name: "shelfLocation",
        type: "text",
        required: true,
      },
      {
        label: t("Notes"),
        name: "notes",
        type: "textarea", // agar matn ko‘p bo‘lishi mumkin bo‘lsa
        required: false,
      },
      {
        label: t("Base Book"),
        name: "baseBookId",
        type: "select",
        required: true,
        options: baseBooks?.data?.data?.map((book: any) => ({
          label: book.title,
          value: book.id,
        })),
      },
    ],
    [t, baseBooks],
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
        key: "inventoryNumber",
        dataIndex: "inventoryNumber",
        title: t("Inventory Number"),
      },
      {
        key: "shelfLocation",
        dataIndex: "shelfLocation",
        title: t("Shelf Location"),
      },
      {
        key: "notes",
        dataIndex: "notes",
        title: t("Notes"),
      },
      {
        key: "baseBookId",
        dataIndex: "baseBookId",
        title: t("Base Book"),
      },
      {
        key: "actions",
        dataIndex: "actions",
        title: t("actions"),
        render: (_: any, record: any) => (
          <div className="flex gap-2">
            <TooltipBtn
              variant={"ampersand"}
              size={"sm"}
              title={t("See")}
              onClick={() => {
                setEditingCategory(record);
                setOpen(true);
              }}
            >
              <Eye />
            </TooltipBtn>
            <TooltipBtn
              variant={"secondary"}
              size={"sm"}
              title={t("Edit")}
              onClick={() => {
                setEditingCategory(record);
                form.reset({
                  inventoryNumber: record.inventoryNumber,
                  shelfLocation: record.shelfLocation,
                  notes: record.notes,
                  baseBookId: record.baseBookId,
                });
                setOpen(true);
              }}
            >
              <PenSquareIcon />
            </TooltipBtn>
            <TooltipBtn
              variant={"destructive"}
              size={"sm"}
              color={"red"}
              title={t("Delete")}
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
    [t, deleteCategory, form, baseBooks],
  );

  const onSubmit = async (data: any) => {
    if (editingBook) {
      updateBook.mutate(
        {
          id: editingBook.id,
          inventoryNumber: data.inventoryNumber,
          shelfLocation: data.shelfLocation,
          notes: data.notes,
          baseBookId: data.id,
        },
        {
          onSuccess: () => {
            toast.success(t("Category updated successfully"));
            setOpen(false);
          },
        },
      );
    } else {
      createCopiesBook.mutate(
        {
          inventoryNumber: data.inventoryNumber,
          shelfLocation: data.shelfLocation,
          notes: data.notes,
          baseBookId: data.baseBookId,
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
    <div className={"cont"}>
      <h1 className={"text-2xl font-semibold py-5"}>{t("Copies books")}</h1>
      <MyTable
        fullscreen
        searchable
        columnVisibility
        isLoading={isLoading}
        columns={columns}
        dataSource={copiesBooks?.data?.list || []}
        header={
          <TooltipBtn
            title={t("Add Category")}
            onClick={() => {
              // setEditingCategory(null);
              // form.reset({ name: "" });
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
              {editingBook ? t("Edit Category") : t("Add Category")}
            </SheetTitle>
          </SheetHeader>
          <div className="p-3">
            <AutoForm
              submitText={editingBook ? t("Edit Category") : t("Add Category")}
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
