"use client";

import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
import { AutoForm, FormField } from "@/components/form/auto-form";
import MyTable, { IColumn } from "@/components/my-table";
import { useForm } from "react-hook-form";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ChevronLeft,
  ChevronRight,
  Eye,
  PenSquareIcon,
  Plus,
  Search,
  Trash,
  X,
} from "lucide-react";
import TooltipBtn from "@/components/tooltip-btn";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/components/models/axios";
import { Image } from "antd";
import ReactPaginate from "react-paginate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import dayjs from "dayjs";

const EBaseBooks = () => {
  const t = useTranslations();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    useState<string>(searchQuery);
  const [actionType, setActionType] = useState<"add" | "edit" | "view">("add");
  const [editingBook, setEditingBook] = useState<Record<string, any> | null>(
    null,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      if (searchQuery !== debouncedSearchQuery) {
        setPageNumber(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearchQuery]);

  const { data: books, isLoading } = useQuery({
    queryKey: ["pdf-books", pageNumber, pageSize, searchQuery, sortDirection],
    queryFn: async () => {
      const { data } = await api.get(
        `/admin/pdf-books?pageNumber=${pageNumber}&pageSize=${pageSize}&sortDirection=${sortDirection}${searchQuery ? `&query=${searchQuery}&field=fullInfo` : ""}`,
      );
      return data;
    },
  });
  const queryClient = useQueryClient();
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get("/admin/categories");
      return data;
    },
    select: (data: Record<string, any>): Record<string, any> => data?.data,
  });
  const createBook = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await api.post("/admin/pdf-books", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdf-books"] });
    },
  });
  const updateBook = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Record<string, any>;
    }) => {
      const res = await api.patch(`/admin/pdf-books/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdf-books"] });
    },
  });
  const deleteBook = useMutation({
    mutationFn: async ({
      data,
      id,
    }: {
      id: string;
      data: Record<string, any>;
    }) => {
      const res = await api.delete(`/admin/pdf-books/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdf-books"] });
    },
  });

  const [open, setOpen] = useState(false);
  const form = useForm();

  const fields = useMemo<FormField[]>(
    () => [
      {
        label: t("Author"),
        name: "author",
        type: "text",
        required: true,
        sm: 12,
        md: 6,
      },
      {
        label: t("Category"),
        name: "categoryId",
        type: "select",
        required: true,
        options: categories.data?.map((category: Record<string, any>) => {
          return {
            label: category?.name,
            value: category?.id,
          };
        }),
        sm: 12,
        md: 6,
      },
      {
        label: t("Title"),
        name: "title",
        type: "text",
        required: true,
        sm: 12,
        md: 6,
      },
      {
        label: t("Description"),
        name: "description",
        type: "textarea",
        required: true,
        sm: 12,
        md: 6,
      },
      {
        label: t("Publication Year"),
        name: "publicationYear",
        type: "number",
        required: true,
        sm: 12,
        md: 6,
      },
      {
        label: t("elektron kitob fayli"),
        name: "pdfUrl",
        type: "file",
        required: true,
        accept: "application/pdf",
        sm: 12,
        md: 6,
      },
      {
        label: t("kitob muqovasi"),
        name: "imageUrl",
        type: "file",
        required: true,
        accept: "image/png, image/jpeg, image/jpg, image/webp",
        sm: 12,
        md: 6,
      },
      {
        label: t("Isbn"),
        name: "isbn",
        type: "text",
        required: true,
        sm: 12,
        md: 6,
      },
      {
        label: t("Page Count"),
        name: "pageCount",
        type: "number",
        required: true,
        sm: 12,
        md: 6,
      },
      {
        label: t("Publisher"),
        name: "publisher",
        type: "text",
        required: true,
        sm: 12,
        md: 6,
      },
      {
        label: t("Language"),
        name: "language",
        type: "text",
        required: true,
        sm: 12,
        md: 6,
      },
      {
        label: t("kitob qaysi tilda yozilgan"),
        name: "script",
        type: "text",
        required: true,
        sm: 12,
        md: 6,
      },
      {
        label: t("size") + " (MB)",
        name: "size",
        type: "number",
        required: true,
        sm: 12,
        md: 6,
      },
    ],
    [t, categories.data],
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
        title: t("kitob muqovasi"),
        dataIndex: "imageUrl",
        key: "imageUrl",
        render: (imageUrl: string) => (
          <Image
            src={imageUrl}
            width={70}
            height={70}
            alt={imageUrl}
            className="w-10 h-10 object-cover rounded-full"
          />
        ),
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
        key: "categoryPreviewDTO",
        dataIndex: ["categoryPreviewDTO", "name"],
        title: t("Category"),
      },
      {
        title: t("Isbn"),
        dataIndex: "isbn",
        key: "isbn",
      },
      {
        title: t("createdAt"),
        dataIndex: "createdAt",
        key: "createdAt",
        render: (createdAt: string) => (
          <p>{dayjs(createdAt).format("DD-MM-YYYY")}</p>
        ),
      },
      {
        title: t("actions"),
        dataIndex: "actions",
        render: (_: any, record: Record<string, any>) => (
          <div className={"flex justify-start items-center gap-2"}>
            <TooltipBtn
              variant={"ampersand"}
              size={"sm"}
              title={t("See")}
              onClick={() => {
                setActionType("view");
                setEditingBook(record);
                setOpen(true);
              }}
            >
              <Eye />
            </TooltipBtn>
            <TooltipBtn
              variant={"view"}
              size={"sm"}
              title={t("Edit")}
              onClick={() => {
                setActionType("edit");
                setEditingBook(record);
                setOpen(true);
              }}
            >
              <PenSquareIcon />
            </TooltipBtn>
            <TooltipBtn
              variant={"destructive"}
              title={t("Delete")}
              size={"sm"}
              color={"red"}
              onClick={() => {
                deleteBook.mutate({ id: record.id, data: record });
              }}
            >
              <Trash />
            </TooltipBtn>
          </div>
        ),
      },
    ],
    [deleteBook, t],
  );

  useEffect(() => {
    if (editingBook) {
      form.reset({
        ...editingBook,
        categoryId: editingBook?.categoryPreviewDTO?.id,
      });
    }
  }, [editingBook, form]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setPageNumber(1);
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingBook) {
        updateBook.mutate({ id: editingBook.id, data });
      } else {
        createBook.mutate(data);
      }
      setOpen(false);
      setEditingBook(null);
      setActionType("add");
    } catch (e) {
      console.log(e);
    }
  };

  // const data;

  return (
    <div>
      <MyTable
        title={
          <h1 className={"text-2xl font-semibold"}>{t("E-Base-Books")}</h1>
        }
        columns={columns}
        isLoading={isLoading}
        dataSource={books?.data?.data}
        pagination={false}
        header={
          <div className={"flex justify-between items-center gap-2 flex-wrap"}>
            <div className="relative max-w-[250px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={16} />
              </div>
              <Input
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-10"
                placeholder={t("Search")}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            {sortDirection === "asc" ? (
              <Button size={"sm"} onClick={() => setSortDirection("desc")}>
                <ArrowUpWideNarrow />
              </Button>
            ) : (
              <Button size={"sm"} onClick={() => setSortDirection("asc")}>
                <ArrowDownWideNarrow />
              </Button>
            )}
            <div>
              <TooltipBtn
                size={"sm"}
                title={t("Add e-book")}
                onClick={() => {
                  setOpen(true);
                }}
              >
                <Plus />
                {t("Add e-book")}
              </TooltipBtn>
            </div>
          </div>
        }
        footer={
          <div className={"flex justify-between items-center gap-2"}>
            <div className="font-bold text-[20px] space-y-1 flex items-center gap-5">
              <p>
                {t("Total Pages")}:{" "}
                <span className="text-green-600">
                  {books?.data?.totalPages}
                </span>
              </p>
              <p>
                {t("Current Page")}:{" "}
                <span className="text-green-600">
                  {books?.data?.currentPage}
                </span>
              </p>
              <p>
                {t("Total Elements")}:{" "}
                <span className="text-green-600">
                  {books?.data?.totalElements}
                </span>
              </p>
            </div>

            <div>
              <ReactPaginate
                breakLabel="..."
                onPageChange={(e) => {
                  const newPageNum = e.selected + 1;
                  setPageNumber(newPageNum);
                }}
                pageRangeDisplayed={pageSize}
                pageCount={Math.ceil(
                  (books?.data?.totalElements || 0) / pageSize,
                )}
                previousLabel={
                  <Button className={"bg-white text-black"}>
                    <ChevronLeft />
                    {t("Return")}
                  </Button>
                }
                nextLabel={
                  <Button className={"bg-white text-black"}>
                    {t("Next")} <ChevronRight />
                  </Button>
                }
                className={"flex justify-center gap-2 items-center my-5"}
                renderOnZeroPageCount={null}
                forcePage={pageNumber - 1}
                pageClassName="px-3 py-1 rounded-full border cursor-pointer"
                activeClassName="bg-green-600 text-white rounded-full"
              />
            </div>
          </div>
        }
      />
      <Sheet
        open={open}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setEditingBook(null);
            setActionType("add");
            form.reset();
          }
          setOpen(open);
        }}
      >
        <SheetContent
          className={
            "rounded-xl hide-scroll bg-white dark:bg-background max-w-[800px]"
          }
        >
          <SheetHeader>
            <SheetTitle asChild>
              <h1 className={"text-xl font-bold"}>
                {actionType === "add"
                  ? t("Add e-book")
                  : actionType === "edit"
                    ? t("Edit e-book")
                    : t("See e-book")}
              </h1>
            </SheetTitle>
          </SheetHeader>
          <div className="py-1">
            <AutoForm
              className={"bg-white dark:bg-background"}
              onSubmit={onSubmit}
              form={form}
              fields={
                actionType === "view"
                  ? fields.map((f) => ({ ...f, disabled: true }))
                  : fields
              }
              showResetButton={false}
              submitText={
                actionType === "add"
                  ? t("Add e-book")
                  : actionType === "edit"
                    ? t("Edit")
                    : t("close")
              }
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EBaseBooks;
