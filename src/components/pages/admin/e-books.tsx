"use client";

import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";
import { AutoForm, FormField } from "@/components/form/auto-form";
import MyTable, { IColumn } from "@/components/my-table";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { useBooking } from "@/components/models/queries/booking";

const EBaseBooks = () => {
  const t = useTranslations();
  const { data: booking, isLoading } = useBooking();

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
        key: "givenAt",
        dataIndex: "givenAt",
        title: t("Given At"),
      },
      {
        key: "dueDate",
        dataIndex: "dueDate",
        title: t("Due Date"),
      },
      {
        key: "status",
        dataIndex: "status",
        title: t("status"),
        render: (status: string) => (
          <span
            className={`px-2 py-1 rounded text-xs ${
              status === "OVERDUE"
                ? "bg-red-100 text-red-600"
                : status === "APPROVED"
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-600"
            }`}
          >
            {status}
          </span>
        ),
      },
    ],
    [t],
  );

  const onSubmit = async (data: any) => {};

  return (
    <div className={"cont"}>
      <h1 className={"text-2xl font-semibold py-5"}>{t("E-Base-Books")}</h1>
      <MyTable
        columns={columns}
        isLoading={isLoading}
        dataSource={booking?.data?.data || []}
        searchable
        // header={
        //   <TooltipBtn
        //     title={t("Add Category")}
        //     onClick={() => {
        //       setOpen(true);
        //     }}
        //   >
        //     <Plus />
        //     {t("Add Category")}
        //   </TooltipBtn>
        // }
      />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <div className="p-3">
            <AutoForm
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

export default EBaseBooks;
