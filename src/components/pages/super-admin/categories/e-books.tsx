"use client";

import { PenSquareIcon, Plus, Search, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import DeleteActionDialog from "@/components/delete-action-dialog";
import { AutoForm, FormField } from "@/components/form/auto-form";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/components/models/queries/e-books-categories";
import MyTable, { IColumn } from "@/components/my-table";
import TooltipBtn from "@/components/tooltip-btn";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

const EBookCategories = () => {
  const t = useTranslations();
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [submitting, setSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Record<
    string,
    any
  > | null>(null);
  const [open, setOpen] = useState(false);
  const form = useForm();

  const [search, setSearch] = useState("");
  const filteredCategories = useMemo(() => {
    if (!categories?.data) return [];
    return categories.data.filter((item: any) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [categories, search]);

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
        width: 200,
        title: t("actions"),
        render: (_: any, record: any) => (
          <div className="flex gap-2">
            <TooltipBtn
              variant={"view"}
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
            <DeleteActionDialog
              title={t("Delete category")}
              onConfirm={() => {
                deleteCategory.mutate(record.id);
              }}
            />
          </div>
        ),
      },
    ],
    [deleteCategory, form, t],
  );

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    if (editingCategory) {
      updateCategory.mutate(
        {
          id: editingCategory.id,
          name: data.name,
        },
        {
          onSuccess: () => {
            toast.success(t("Category updated successfully"));
            setSubmitting(false);
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
            setSubmitting(false);
            setOpen(false);
          },
          onError: (error: any) => {
            if (error?.response?.status === 409) {
              toast.error(t("This category already exists"));
              setSubmitting(false);
            } else {
              toast.error(t("Error creating category"));
              setSubmitting(false);
            }
          },
        },
      );
    }
  };

  return (
    <div>
      <MyTable
        className={"p-2"}
        title={
          <h1 className="text-2xl font-semibold">
            {t("Categories of E-Base Books")}
          </h1>
        }
        columns={columns}
        isLoading={isLoading}
        dataSource={filteredCategories}
        pagination={false}
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

            {/* Add Category Button */}
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
          </div>
        }
      />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {submitting || editingCategory
                ? t("Edit Category")
                : t("Add Category")}
            </SheetTitle>
          </SheetHeader>
          <div className="p-3">
            <AutoForm
              submitText={
                submitting || editingCategory
                  ? t("Edit Category")
                  : t("Add Category")
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
