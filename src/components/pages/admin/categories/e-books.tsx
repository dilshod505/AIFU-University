"use client";

import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";
import { Plus } from "lucide-react";
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
} from "@/components/models/queries/e-books-categories";

const CategoriesPage = () => {
  const t = useTranslations();
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();

  const [open, setOpen] = useState(false);
  const form = useForm();

  const fields = useMemo<FormField[]>(
    () => [
      {
        label: t("Name"),
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
        title: t("Name"),
      },
    ],
    [t],
  );

  const onSubmit = async (data: any) => {
    await createCategory.mutateAsync(data);
    setOpen(false);
  };

  return (
    <div className="cont">
      <h1 className="text-2xl font-semibold py-5">
        {t("Categories of E-Books")}
      </h1>

      <MyTable
        columns={columns}
        isLoading={isLoading}
        dataSource={categories?.data || []}
        searchable
        header={
          <TooltipBtn
            title={t("Add Category")}
            onClick={() => {
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
            <SheetTitle>{t("Add Category")}</SheetTitle>
          </SheetHeader>
          <div className="p-3">
            <AutoForm
              submitText={t("Add Category")}
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

export default CategoriesPage;
