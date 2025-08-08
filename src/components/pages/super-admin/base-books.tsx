"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useBaseBooksCategory } from "@/components/models/queries/base-books-category";
import { Button } from "@/components/ui/button";
import ReactPaginate from "react-paginate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Divider } from "antd";

const BaseBooks = () => {
  const t = useTranslations();
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    useState<string>(searchQuery);
  const { data: baseBooks, isLoading } = useBaseBook({
    pageNum,
    pageSize: pageSize,
    searchQuery:
      debouncedSearchQuery.length > 0 ? debouncedSearchQuery : undefined,
  });
  const createBaseBook = useCreateBaseBook();
  const { data: categories } = useBaseBooksCategory();

  const [editingCategory, setEditingCategory] = useState<Record<
    string,
    any
  > | null>(null);
  const [open, setOpen] = useState(false);
  const form = useForm();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      if (searchQuery !== debouncedSearchQuery) {
        setPageNum(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearchQuery]);

  const fields = useMemo<FormField[]>(
    () => [
      {
        label: t("Title"),
        name: "title",
        type: "text",
        required: true,
      },
      {
        label: t("category"),
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
        label: t("Isbn"),
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
        isLoading={isLoading}
        pagination={false}
        header={
          <div className={"flex justify-start items-center gap-2"}>
            <Input
              placeholder={t("search")}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select
              value={pageSize.toString()}
              onValueChange={(a: string) => setPageSize(Number(a) as any)}
            >
              <SelectTrigger suppressHydrationWarning>
                <Tooltip>
                  <TooltipTrigger>
                    <SelectValue placeholder={pageSize} />
                  </TooltipTrigger>
                  <TooltipContent sideOffset={5}>
                    {t("select data size")}
                  </TooltipContent>
                </Tooltip>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"10"}>10</SelectItem>
                <SelectItem value={"25"}>25</SelectItem>
                <SelectItem value={"50"}>50</SelectItem>
                <SelectItem value={"100"}>100</SelectItem>
              </SelectContent>
            </Select>
            <TooltipBtn
              size={"sm"}
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
      <Divider />
      <ReactPaginate
        breakLabel="..."
        onPageChange={(e) => {
          const newPageNum = e.selected + 1;
          setPageNum(newPageNum);
        }}
        pageRangeDisplayed={pageSize}
        pageCount={Math.ceil((baseBooks?.data?.totalElements || 0) / pageSize)}
        previousLabel={
          <Button className={"bg-white text-black"}>
            <ChevronLeft />
            {t("Previous")}
          </Button>
        }
        nextLabel={
          <Button className={"bg-white text-black"}>
            {t("Next")} <ChevronRight />
          </Button>
        }
        className={"flex justify-center gap-2 items-center"}
        renderOnZeroPageCount={null}
        forcePage={pageNum - 1}
        pageClassName="px-3 py-1 rounded-full border cursor-pointer"
        activeClassName="bg-green-600 text-white rounded-full"
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
