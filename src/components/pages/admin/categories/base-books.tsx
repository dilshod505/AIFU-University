"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useBaseBooksCategory } from "@/components/models/queries/base-books-category";
import MyTable, { IColumn } from "@/components/my-table";
import { FormField } from "@/components/form/auto-form";
import TooltipBtn from "@/components/tooltip-btn";
import { Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const BaseBooks = () => {
  const t = useTranslations();
  const { data, isLoading } = useBaseBooksCategory();
  const [isOpen, setIsOpen] = useState<boolean>(false);

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

  return (
    <div className={"cont"}>
      <h1 className={"text-2xl font-semibold py-5"}>
        {t("Categories of Base Books")}
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
        dataSource={data.data}
      />

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t("Add Regular book category")}</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default BaseBooks;
