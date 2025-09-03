"use client";

import DeleteActionDialog from "@/components/delete-action-dialog";
import { AutoForm, type FormField } from "@/components/form/auto-form";
import { api } from "@/components/models/axios";
import MyTable, { type IColumn } from "@/components/my-table";
import TooltipBtn from "@/components/tooltip-btn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "antd";
import dayjs from "dayjs";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ChevronLeft,
  ChevronRight,
  Eye,
  PenSquareIcon,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import ReactPaginate from "react-paginate";
import { toast } from "sonner";

const EBaseBooks = () => {
  const t = useTranslations();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    useState<string>(searchQuery);
  const [actionType, setActionType] = useState<"add" | "edit" | "view">("add");
  const form = useForm();
  const [editingBook, setEditingBook] = useState<Record<string, any> | null>(
    null
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
        `/admin/pdf-books?pageNumber=${pageNumber}&pageSize=${pageSize}&sortDirection=${sortDirection}${searchQuery ? `&query=${searchQuery}&field=fullInfo` : ""}`
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

  const getById = useQuery({
    queryKey: ["get-book-by-id", editingBook, actionType],
    queryFn: async () => {
      if (!editingBook?.id) return null;
      const { data } = await api.get(`/admin/pdf-books/${editingBook.id}`);
      return data;
    },
    enabled: !!editingBook?.id,
    // staleTime: 0, // Ensure fresh data on each edit
  });

  const createBook = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await api.post("/admin/pdf-books", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdf-books"] });
      toast.success(t("E-book created successfully"));
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
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/pdf-books/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdf-books"] });
    },
  });

  const [open, setOpen] = useState(false);

  const fields = useMemo<FormField[]>(
    () => [
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
        label: t("elektron kitob fayli"),
        name: "pdfUrl",
        type: "file",
        required: true,
        accept: "application/pdf",
        sm: 12,
        md: 6,
      },
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
        options:
          categories.data?.map((category: Record<string, any>) => ({
            label: category?.name,
            value: category?.id,
          })) || [], // Fallback to empty array to avoid undefined
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
        label: t("Publication Year"),
        name: "publicationYear",
        type: "number",
        required: true,
        sm: 12,
        md: 6,
        max: new Date().getFullYear(),
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
        min: 1,
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
        label: t("Description"),
        name: "description",
        type: "textarea",
        required: true,
        sm: 12,
        md: 6,
      },
    ],
    [t, categories.data]
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
            src={imageUrl || "/placeholder.svg"}
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
            <DeleteActionDialog
              title={t("Delete")}
              onConfirm={() => deleteBook.mutate(record.id)}
            />
          </div>
        ),
      },
    ],
    [deleteBook, t]
  );

  useEffect(() => {
    if (editingBook && getById.data?.data && !getById.isLoading) {
      form.reset({
        ...getById.data.data,
        categoryId: getById.data.data.categoryPreview?.id
          ? +getById.data.data.categoryPreview.id
          : undefined,
      });
    }
  }, [editingBook, getById.data, getById.isLoading, form]);

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
        updateBook.mutate({
          id: editingBook.id,
          data: {
            ...data,
            imageUrl:
              typeof data.imageUrl === "string"
                ? data.imageUrl
                : data.imageUrl?.url,
            pdfUrl:
              typeof data.pdfUrl === "string" ? data.pdfUrl : data.pdfUrl?.url,
            size:
              typeof data.size === "number" ? data.size : data.pdfUrl?.sizeMB,
          },
        });
      } else {
        createBook.mutate({
          ...data,
          imageUrl:
            typeof data.imageUrl === "string"
              ? data.imageUrl
              : data.imageUrl?.url,
          pdfUrl:
            typeof data.pdfUrl === "string" ? data.pdfUrl : data.pdfUrl?.url,
          size: data.pdfUrl?.sizeMB,
        });
      }
      setOpen(false);
      setEditingBook(null);
      setActionType("add");
      form.reset();
    } catch (e) {
      console.log(e);
    }
  };

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
          <div className={"flex justify-between items-center gap-2 flex-wrap"}>
            <div className="font-bold text-[20px] space-y-1 flex items-center gap-5">
              <p className="text-sm flex justify-center items-center gap-2">
                {t("Total Pages")}:{" "}
                <span className="text-green-600">
                  {books?.data?.totalPages}
                </span>
              </p>
              <p className="text-sm flex justify-center items-center gap-2">
                {t("Current Page")}:{" "}
                <span className="text-green-600">
                  {books?.data?.currentPage}
                </span>
              </p>
              <p className="text-sm flex justify-center items-center gap-2">
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
                  (books?.data?.totalElements || 0) / pageSize
                )}
                previousLabel={
                  <Button className="bg-white text-black">
                    <ChevronLeft />
                    {t("Return")}
                  </Button>
                }
                nextLabel={
                  <Button className="bg-white text-black">
                    {t("Next")} <ChevronRight />
                  </Button>
                }
                className="flex justify-center gap-2 items-center my-5"
                renderOnZeroPageCount={null}
                forcePage={pageNumber - 1}
                pageClassName="list-none"
                pageLinkClassName="px-3 py-1 rounded-full border cursor-pointer block"
                activeLinkClassName="bg-green-600 text-white rounded-full"
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
            form.reset({}); // Reset form only when closing
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
                    : t("Book Details")}{" "}
                {/* Updated title for detail view */}
              </h1>
            </SheetTitle>
          </SheetHeader>
          <div className="py-1">
            {actionType === "view" ? (
              <div className="space-y-6">
                {getById.isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : getById.data?.data ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Book Cover */}
                    <div className="space-y-4">
                      <Image
                        height={400}
                        width={"100%"}
                        src={getById.data.data.imageUrl || "/placeholder.svg"}
                        alt={getById.data.data.title}
                        className="w-full h-[200px] object-cover bg-center rounded-lg shadow-lg"
                      />
                      <div className="text-center">
                        <Button
                          onClick={() =>
                            window.open(getById.data.data.pdfUrl, "_blank")
                          }
                          className="w-full"
                        >
                          {t("Open PDF")}
                        </Button>
                      </div>
                    </div>

                    {/* Book Details */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {t("Title")}
                        </h3>
                        <p className="text-xl font-bold">
                          {getById.data.data.title}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {t("Author")}
                        </h3>
                        <p>{getById.data.data.author}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {t("Category")}
                        </h3>
                        <p>{getById.data.data.categoryPreview?.name}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {t("Publication Year")}
                          </h3>
                          <p>{getById.data.data.publicationYear}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {t("Page Count")}
                          </h3>
                          <p>{getById.data.data.pageCount}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {t("Language")}
                          </h3>
                          <p>{getById.data.data.language}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Script
                          </h3>
                          <p>{getById.data.data.script}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t("Publisher")}
                        </h3>
                        <p>{getById.data.data.publisher}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t("Isbn")}
                        </h3>
                        <p>{getById.data.data.isbn}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          File Size
                        </h3>
                        <p>{getById.data.data.size} MB</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Created Date
                        </h3>
                        <p>
                          {dayjs(getById.data.data.createdDate).format(
                            "DD-MM-YYYY"
                          )}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t("Description")}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {getById.data.data.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {t("Failed to load book details")}
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    {t("close")}
                  </Button>
                </div>
              </div>
            ) : (
              <AutoForm
                className={
                  "bg-white dark:bg-background p-0 px-5 border-none space-y-0"
                }
                onSubmit={onSubmit}
                form={form}
                loading={!editingBook || getById.isLoading}
                fields={fields}
                showResetButton={false}
                submitText={actionType === "add" ? t("Add e-book") : t("Edit")}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EBaseBooks;
