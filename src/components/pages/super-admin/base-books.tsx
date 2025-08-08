"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  useBaseBook,
  useCreateBaseBook,
} from "@/components/models/queries/base-book";
import MyTable, { IColumn } from "@/components/my-table";
import { AutoForm, FormField } from "@/components/form/auto-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import TooltipBtn from "@/components/tooltip-btn";
import { Plus } from "lucide-react";
import { useBaseBooksCategory } from "@/components/models/queries/base-books-category";

const BaseBooks = () => {
  const t = useTranslations();
  const { data: baseBooks, isLoading } = useBaseBook({
    pageNum: 1,
    pageSize: 100,
  });
  const createBaseBook = useCreateBaseBook();
  const { data: categories } = useBaseBooksCategory();

  const [editingCategory, setEditingCategory] = useState<Record<
    string,
    any
  > | null>(null);
  const [open, setOpen] = useState(false);
  const form = useForm();

  const fields = useMemo<FormField[]>(
    () => [
      {
        label: t("Title"),
        name: "title",
        type: "text",
        required: true,
      },
      {
        label: t("Category ID"),
        name: "categoryId",
        type: "select",
        required: true,
        options: categories?.data?.map((category: any) => ({
          label: category.name,
          value: category.id,
        })),
      },
      {
        label: t("Author"),
        name: "author",
        type: "text",
        required: true,
      },
      {
        label: t("Series"),
        name: "series",
        type: "text",
        required: false,
      },
      {
        label: t("Title details"),
        name: "titleDetails",
        type: "text",
        required: false,
      },
      {
        label: t("Publication year"),
        name: "publicationYear",
        type: "number",
        required: true,
      },
      {
        label: t("Publisher"),
        name: "publisher",
        type: "text",
        required: true,
      },
      {
        label: t("Publication City"),
        name: "publicationCity",
        type: "text",
        required: false,
      },
      {
        label: t("ISBN"),
        name: "isbn",
        type: "text",
        required: false,
      },
      {
        label: t("Page Count"),
        name: "pageCount",
        type: "number",
        required: true,
      },
      {
        label: t("Language"),
        name: "language",
        type: "text",
        required: true,
      },
      {
        label: t("UDC"),
        name: "udc",
        type: "text",
        required: false,
      },
    ],
    [categories?.data, t],
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
        key: "title",
        dataIndex: "title",
        title: t("Title"),
      },
      {
        key: "author",
        dataIndex: "author",
        title: t("Author"),
      },
      {
        key: "isbn",
        dataIndex: "isbn",
        title: t("Isbn"),
      },
      {
        key: "totalCopies",
        dataIndex: "totalCopies",
        title: t("Total copies"),
      },
    ],
    [t],
  );

  const onSubmit = async (data: any) => {
    try {
      await createBaseBook.mutateAsync(data);
      toast.success("Kitob muvaffaqiyatli qo‘shildi");
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    }
  };

  return (
    <div>
      <h1 className={"text-2xl font-semibold py-5"}>{t("Base books")}</h1>
      <MyTable
        columns={columns}
        dataSource={baseBooks?.data?.data || []}
        searchable
        isLoading={isLoading}
        pagination={false}
        header={
          <TooltipBtn
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

export default BaseBooks;
