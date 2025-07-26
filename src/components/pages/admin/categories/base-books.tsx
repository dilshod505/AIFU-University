"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  useBaseBooksCategory,
  useCreateBaseBooksCategory,
  useDeleteBaseBooksCategory,
  useUpdateBaseBooksCategory,
} from "@/components/models/queries/base-books-category";
import MyTable, { IColumn } from "@/components/my-table";
import { AutoForm, FormField } from "@/components/form/auto-form";
import TooltipBtn from "@/components/tooltip-btn";
import { Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const BaseBooks = () => {
  const t = useTranslations();
  const { data, isLoading } = useBaseBooksCategory();
  const createCategory = useCreateBaseBooksCategory();
  const updateCategory = useUpdateBaseBooksCategory();
  const deleteCategory = useDeleteBaseBooksCategory();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<{
    id: string | number;
    name: string;
  } | null>(null);
  const form = useForm({
    defaultValues: {
      name: "",
    },
  });

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
      {
        key: "actions",
        dataIndex: "actions",
        title: t("Actions"),
        render: (_: any, record: any) => (
          <div className={"flex gap-2"}>
            <TooltipBtn
              size={"sm"}
              onClick={() => {
                setEditingCategory(record);
                setIsOpen(true);
              }}
            >
              {t("Edit")}
            </TooltipBtn>
            <TooltipBtn
              variant={"destructive"}
              size={"sm"}
              color={"red"}
              onClick={() => {
                deleteCategory.mutate(record.id);
              }}
            >
              {t("Delete")}
            </TooltipBtn>
          </div>
        ),
      },
    ],
    [t],
  );

  const fields = useMemo<FormField[]>(
    () => [
      {
        label: t("Category name"),
        name: "name",
        type: "text",
        required: true,
      },
    ],
    [t],
  );

  const handleSubmit = async (values: Record<string, any>) => {
    try {
      if (editingCategory) {
        updateCategory.mutate({
          id: editingCategory.id,
          name: values.name,
        });
        if (updateCategory.isSuccess) {
          toast.success(t("Category updated"));
          setIsOpen(false);
        }
      } else {
        createCategory.mutate(values);
        if (createCategory.isSuccess) {
          toast.success(t("Category created"));
          setIsOpen(false);
        }
      }

      form.reset();
      setEditingCategory(null);
      setIsOpen(false);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  useEffect(() => {
    if (editingCategory) {
      form.setValue("name", editingCategory.name);
    }
  }, [editingCategory]);

  return (
    <div className={"cont"}>
      <h1 className={"text-2xl font-semibold py-5"}>
        {t("Categories of Base BaseBooks")}
      </h1>

      <MyTable
        columns={columns}
        searchable
        columnVisibility
        fullscreen
        header={
          <TooltipBtn size={"sm"} onClick={() => setIsOpen(true)}>
            <Plus />
            {t("Add Regular book category")}
          </TooltipBtn>
        }
        isLoading={isLoading}
        dataSource={data?.data}
      />

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {editingCategory
                ? t("Edit Regular book category")
                : t("Add Regular book category")}
            </SheetTitle>
          </SheetHeader>
          <div className="px-3">
            <AutoForm
              form={form}
              fields={fields}
              onSubmit={handleSubmit}
              submitText={t("Add category")}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default BaseBooks;
