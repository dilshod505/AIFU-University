"use client";

import DeleteActionDialog from "@/components/delete-action-dialog";
import { AutoForm, FormField } from "@/components/form/auto-form";
import {
  useBaseBooksCategory,
  useCreateBaseBooksCategory,
  useDeleteBaseBooksCategory,
  useUpdateBaseBooksCategory,
} from "@/components/models/queries/base-books-category";
import MyTable, { IColumn } from "@/components/my-table";
import TooltipBtn from "@/components/tooltip-btn";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PenSquareIcon, Plus, Search, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
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
  const form = useForm();

  const [search, setSearch] = useState("");
  const filteredCategories = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((item: any) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [data, search]);

  const columns = useMemo<IColumn[]>(
    () => [
      {
        key: "index",
        dataIndex: "index",
        title: "#",
        width: 300,
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        key: "name",
        dataIndex: "name",
        title: t("name"),
        width: 350,
      },
      {
        key: "bookCount",
        dataIndex: "bookCount",
        title: t("Book count"),
        width: 400,
      },
      {
        key: "actions",
        dataIndex: "actions",
        title: t("actions"),
        width: 200,
        render: (_: any, record: any) => (
          <div className={"flex gap-2"}>
            <TooltipBtn
              variant={"view"}
              title={t("Edit")}
              size={"sm"}
              onClick={() => {
                setEditingCategory(record);
                setIsOpen(true);
              }}
            >
              <PenSquareIcon />
            </TooltipBtn>
            <DeleteActionDialog
              onConfirm={() => deleteCategory.mutate(record.id)}
              title={t("Delete category")}
            />
          </div>
        ),
      },
    ],
    [deleteCategory, t],
  );

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

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: Record<string, any>) => {
    setSubmitting(true);
    try {
      const isDuplicate = data?.data?.some(
        (item: any) =>
          item.name.toLowerCase() === values.name.toLowerCase() &&
          item.id !== editingCategory?.id,
      );
      if (isDuplicate) {
        toast.error(t("This category name already exists"));
        setSubmitting(false);
        return;
      }

      if (editingCategory) {
        updateCategory.mutate({
          id: editingCategory.id,
          name: values.name,
        });
        if (updateCategory.isSuccess) {
          toast.success(t("Category updated successfullyy"));
          form.reset({ name: "" });
          setSubmitting(false);
          setIsOpen(false);
        }
      } else {
        createCategory.mutate(values);
        if (createCategory.isSuccess) {
          toast.success(t("Category created successfully"));
          form.reset({ name: "" });
          setSubmitting(false);
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
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (editingCategory) {
      form.reset({ name: editingCategory.name }); // ✅ reset bilan setValue emas
    } else {
      form.reset({ name: "" }); // ✅ yangi qo‘shishda tozalanadi
    }
  }, [editingCategory, form]);

  return (
    <div>
      <MyTable
        title={
          <h1 className={"text-2xl font-semibold"}>
            {t("Categories of Base Books")}
          </h1>
        }
        columns={columns}
        searchable={false}
        className={"p-2"}
        header={
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Bar Container */}
            <div className="flex-1 rounded-full shadow-lg p-1 flex items-center gap-2">
              {/* Filter Icon (inactive state) */}
              {/*<TooltipBtn*/}
              {/*  className="flex-shrink-0 mr-1 p-2.5 rounded-full transition-colors"*/}
              {/*  title={t("Boshqa filter mavjud emas")}*/}
              {/*>*/}
              {/*  <Settings2 size={18} />*/}
              {/*</TooltipBtn>*/}
              {/* Search Input */}
              <div className="flex-1 flex items-center">
                <Input
                  placeholder={t("Search category")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                />
              </div>
              <TooltipBtn
                title={t("Search")}
                className="flex-shrink-0 mr-1 p-2.5 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                <Search size={18} />
              </TooltipBtn>
            </div>

            {/* Add Button */}
            <TooltipBtn size={"sm"} onClick={() => setIsOpen(true)}>
              <Plus />
              {t("Add Regular book category")}
            </TooltipBtn>
          </div>
        }
        isLoading={isLoading}
        dataSource={filteredCategories}
        pagination={false}
      />

      <Sheet
        open={isOpen}
        onOpenChange={(r: boolean) => {
          if (!r) {
            setEditingCategory(null);
            form.reset();
          }
          setIsOpen(false);
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {submitting || editingCategory
                ? t("Edit Regular book category")
                : t("Add Regular book category")}
            </SheetTitle>
            <SheetDescription className="hidden" />
          </SheetHeader>
          <div className="px-3">
            <AutoForm
              form={form}
              fields={fields}
              loading={submitting}
              onSubmit={handleSubmit}
              submitText={t("Add Category")}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default BaseBooks;
