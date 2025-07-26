"use client";

import MyTable, { IColumn } from "@/components/my-table";
import { useTranslations } from "next-intl";
import TooltipBtn from "@/components/tooltip-btn";
import { Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AutoForm, FormField } from "@/components/form/auto-form";
import { useForm } from "react-hook-form";
import React, { useMemo, useState } from "react";
import {
  useCreateEBooks,
  useEBooks,
  useUpdateEBooks,
} from "@/components/models/queries/e-books";

const EBooks = () => {
  const t = useTranslations();
  const { data: eBook } = useEBooks();
  const createBook = useCreateEBooks();
  const updateBook = useUpdateEBooks();
  const [editingBook, setEditingBook] = useState<Record<string, any> | null>(
    null,
  );

  const [open, setOpen] = useState<boolean>(false);
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
        width: 50,
        render: (_: any, record: any, index: number) => index + 1,
      },
      {
        key: "totalPages",
        dataIndex: "totalPages",
        title: t("Total Pages"),
      },
    ],
    [t],
  );

  const onSubmit = async (data: any) => {
    if (editingBook) {
      await updateBook(editingBook.id, data);
    } else {
      await createBook(data);
    }
    setOpen(false);
  };

  return (
    <div className={"cont"}>
      <h1 className={"text-2xl font-semibold py-5"}>
        {t("Categories of E-Books")}
      </h1>
      <MyTable
        columns={columns}
        dataSource={eBook}
        columnVisibility
        fullscreen
        searchable
        header={
          <TooltipBtn
            title={t("Add book")}
            onClick={() => {
              setEditingBook(null);
              form.reset({
                title: "",
                description: "",
                totalPages: 0,
                totalLanguages: 0,
                categoryId: "",
                attachmentId: "",
              });
              setOpen(true);
            }}
          >
            <Plus />
            {t("Add book")}
          </TooltipBtn>
        }
      />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              <h1 className={"text-lg font-semibold"}>
                {editingBook ? t("Edit book") : t("Add book")}
              </h1>
            </SheetTitle>
          </SheetHeader>
          <div className="p-3 overflow-y-auto">
            <AutoForm
              submitText={editingBook ? t("Edit book") : t("Add book")}
              showResetButton={false}
              onSubmit={onSubmit}
              form={form}
              fields={fields}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EBooks;
