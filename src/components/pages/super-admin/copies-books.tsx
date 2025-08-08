"use client";
import React, { useEffect, useMemo, useState } from "react";
import { AutoForm, FormField } from "@/components/form/auto-form";
import MyTable, { IColumn } from "@/components/my-table";
import TooltipBtn from "@/components/tooltip-btn";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  PenSquareIcon,
  Plus,
  Search,
  Trash,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useCopiesBooks,
  useCopiesBooksId,
  useCopiesBooksSearch,
  useCreateCopiesBooks,
  useDeleteCopiesBooks,
  useUpdateCopiesBooks,
} from "@/components/models/queries/copies-books";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { useBaseBook } from "@/components/models/queries/base-book";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Divider } from "antd";
import { Button } from "@/components/ui/button";
import ReactPaginate from "react-paginate";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export const CopiesBooks = () => {
  const t = useTranslations();
  const createCopiesBook = useCreateCopiesBooks();
  const deleteCategory = useDeleteCopiesBooks();
  const updateBook = useUpdateCopiesBooks();
  const [actionType, setActionType] = useState<"add" | "edit" | "view">("add");
  const [editingBook, setEditingCategory] = useState<Record<
    string,
    any
  > | null>(null);

  const searchParams = useSearchParams();
  const queryParams = new URLSearchParams(searchParams);

  const [pageSize, setPageSize] = useState<number>(
    Number(searchParams.get("pageSize")) || 10,
  );
  const [pageNum, setPageNum] = useState<number>(
    Number(searchParams.get("pageNumber")) || 1,
  );

  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get("search") || "",
  );
  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    useState<string>(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      if (searchQuery !== debouncedSearchQuery) {
        setPageNum(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearchQuery]);

  const { data: copiesBooks, isLoading } = useCopiesBooks({
    pageSize,
    pageNumber: pageNum,
  });

  const { data: searchResults, isLoading: isSearchLoading } =
    useCopiesBooksSearch({
      query: debouncedSearchQuery,
      field: "book",
      pageSize,
      pageNumber: pageNum,
    });

  // Determine which data to use
  const isSearching = debouncedSearchQuery.trim().length > 0;
  const currentData = isSearching ? searchResults : copiesBooks;
  const currentLoading = isSearching ? isSearchLoading : isLoading;

  const { data: bookDetail, isLoading: isDetailLoading } = useCopiesBooksId({
    id: editingBook?.id,
  });

  const { data: baseBooks } = useBaseBook({ pageNum, pageSize });

  const [open, setOpen] = useState<boolean>(false);
  const [open2, setOpen2] = useState<boolean>(false);
  const form = useForm();

  const fields = useMemo<FormField[]>(
    () => [
      {
        label: t("Base Book"),
        name: "baseBookId",
        type: "select",
        required: true,
        options: baseBooks?.data?.data?.map(
          (book: Record<string, any>, i: number) => ({
            label: `${i + 1}. ${book.title}`,
            value: book.id,
          }),
        ),
      },
      {
        label: t("Inventory Number"),
        name: "inventoryNumber",
        type: "text",
        required: true,
      },
      {
        label: t("Shelf Location"),
        name: "shelfLocation",
        type: "text",
        required: true,
      },
      {
        label: t("Notes"),
        name: "notes",
        type: "textarea",
        required: false,
      },
    ],
    [t, baseBooks],
  );

  const columns = useMemo<IColumn[]>(
    () => [
      {
        key: "index",
        dataIndex: "index",
        title: "#",
        render: (_: any, __: any, index: number) =>
          (pageNum - 1) * pageSize + index + 1,
      },
      {
        key: "inventoryNumber",
        dataIndex: "inventoryNumber",
        title: t("Inventory Number"),
      },
      {
        key: "shelfLocation",
        dataIndex: "shelfLocation",
        title: t("Shelf Location"),
      },
      {
        key: "notes",
        dataIndex: "notes",
        title: t("Notes"),
      },
      {
        key: "baseBookId",
        dataIndex: "baseBookId",
        title: t("Base Book"),
      },
      {
        key: "isTaken",
        dataIndex: "isTaken",
        title: t("isTaken"),
        render: (value: boolean) => (
          <Badge variant={value ? "default" : "destructive"}>
            {value ? t("Active") : t("Inactive")}
          </Badge>
        ),
      },
      {
        key: "actions",
        dataIndex: "actions",
        width: 200,
        title: t("actions"),
        render: (_: any, record: any) => (
          <div className="flex gap-2">
            <TooltipBtn
              variant={"ampersand"}
              size={"sm"}
              title={t("See")}
              onClick={() => {
                setActionType("view");
                setEditingCategory(record);
                setOpen2(true);
                setOpen(false);
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
                setEditingCategory(record);
                form.reset({
                  inventoryNumber: record.inventoryNumber || "",
                  shelfLocation: record.shelfLocation || "",
                  notes: record.notes || "",
                  baseBookId: record.baseBookId || "",
                });
                setOpen(true);
                setOpen2(false);
              }}
            >
              <PenSquareIcon />
            </TooltipBtn>
            <TooltipBtn
              variant={"destructive"}
              size={"sm"}
              color={"red"}
              title={t("Delete")}
              onClick={() => {
                deleteCategory.mutate(record.id, {
                  onSuccess: () =>
                    toast.success(t("Category deleted successfully")),
                  onError: () => toast.error(t("Error deleting category")),
                });
              }}
            >
              <Trash />
            </TooltipBtn>
          </div>
        ),
      },
    ],
    [t, deleteCategory, form, pageNum, pageSize],
  );

  useEffect(() => {
    if (!editingBook && actionType === "add" && open) {
      form.reset({
        inventoryNumber: "",
        shelfLocation: "",
        notes: "",
        baseBookId: "",
      });
    }
  }, [editingBook, open, form, actionType]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim()) {
      queryParams.set("search", value);
    } else {
      queryParams.delete("search");
    }
    window.history.replaceState(null, "", `?${queryParams.toString()}`);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    queryParams.delete("search");
    setPageNum(1);
    window.history.replaceState(null, "", `?${queryParams.toString()}`);
  };

  const onSubmit = async (data: any) => {
    if (editingBook) {
      updateBook.mutate(
        {
          id: editingBook.id,
          inventoryNumber: data.inventoryNumber,
          shelfLocation: data.shelfLocation,
          notes: data.notes,
          baseBookId: data.baseBookId,
        },
        {
          onSuccess: () => {
            toast.success(t("Category updated successfully"));
            setOpen(false);
          },
        },
      );
    } else {
      createCopiesBook.mutate(
        {
          inventoryNumber: data.inventoryNumber,
          shelfLocation: data.shelfLocation,
          notes: data.notes,
          baseBookId: data.baseBookId,
        },
        {
          onSuccess: () => {
            toast.success(t("Category created successfully"));
            setOpen(false);
          },
        },
      );
    }
    setActionType("add");
    setEditingCategory(null);
    setOpen(false);
    setOpen2(false);
  };

  return (
    <div className={""}>
      <h1 className={"text-2xl font-semibold py-5"}>{t("Copies books")}</h1>

      {/* Search Input */}

      {/* Search Results Info */}
      {isSearching && (
        <div className="mb-4 text-sm text-gray-600">
          {currentLoading ? (
            <span>{t("Searching...")}</span>
          ) : (
            <span>
              {t("Found")} {currentData?.data?.totalElements || 0}{" "}
              {t("results for")} "{debouncedSearchQuery}"
            </span>
          )}
        </div>
      )}

      <MyTable
        columnVisibility
        pagination={false}
        isLoading={currentLoading}
        columns={columns}
        dataSource={currentData?.data?.list || []}
        header={
          <div className={"flex justify-between items-center gap-10"}>
            <div className="relative w-[250px]">
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
            <div>
              <TooltipBtn
                title={t("Add Category")}
                onClick={() => {
                  setOpen(true);
                }}
              >
                <Plus />
                {t("Add Category")}
              </TooltipBtn>
            </div>
          </div>
        }
      />

      <Divider />

      {/* Pagination */}
      <ReactPaginate
        breakLabel="..."
        onPageChange={(e) => {
          const newPageNum = e.selected + 1;
          setPageNum(newPageNum);
          queryParams.set("pageNumber", String(newPageNum));
          window.history.replaceState(null, "", `?${queryParams.toString()}`);
        }}
        pageRangeDisplayed={pageSize}
        pageCount={Math.ceil(
          (currentData?.data?.totalElements || 0) / pageSize,
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
        className={"flex justify-center gap-2 items-center"}
        renderOnZeroPageCount={null}
        forcePage={pageNum - 1}
        pageClassName="px-3 py-1 rounded-full border cursor-pointer"
        activeClassName="bg-green-600 text-white rounded-full"
      />

      {/* Add/Edit Sheet */}
      {(actionType === "add" || actionType === "edit") && (
        <Sheet
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
              setOpen(false);
              setActionType("add");
              setEditingCategory(null);
            }
          }}
        >
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {actionType === "add"
                  ? t("Add Category")
                  : actionType === "edit"
                    ? t("Edit Category")
                    : ""}
              </SheetTitle>
            </SheetHeader>
            <div className="p-3">
              <AutoForm
                submitText={
                  editingBook ? t("Edit Category") : t("Add Category")
                }
                onSubmit={onSubmit}
                form={form}
                fields={fields}
                showResetButton={false}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* View Sheet */}
      {actionType === "view" && (
        <Sheet
          open={open2}
          onOpenChange={(v) => {
            setOpen2(v);
            if (!v) {
              setOpen(false);
              setOpen2(false);
              setActionType("add");
              setEditingCategory(null);
            }
          }}
        >
          <SheetContent>
            <SheetHeader
              className={"flex justify-center items-center text-[20px]"}
            >
              <SheetTitle>{t("Book Copy Detail")}</SheetTitle>
            </SheetHeader>
            <div className="p-3">
              <div className="space-y-4">
                <p className={"flex justify-between items-center"}>
                  <strong>{t("Inventory Number")}:</strong>{" "}
                  {!isDetailLoading ? (
                    bookDetail.data?.inventoryNumber
                  ) : (
                    <Skeleton className="w-1/2 h-5" />
                  )}
                </p>
                <p className={"flex justify-between items-center"}>
                  <strong>{t("Shelf Location")}:</strong>{" "}
                  {!isDetailLoading ? (
                    bookDetail.data?.shelfLocation
                  ) : (
                    <Skeleton className="w-1/2 h-5" />
                  )}
                </p>
                <p className={"flex justify-between items-center"}>
                  <strong>{t("Notes")}:</strong>{" "}
                  {!isDetailLoading ? (
                    bookDetail.data?.notes
                  ) : (
                    <Skeleton className="w-1/2 h-5" />
                  )}
                </p>
                <p className={"flex justify-between items-center"}>
                  <strong>{t("Base Book")}:</strong>{" "}
                  {!isDetailLoading ? (
                    bookDetail.data?.baseBookId
                  ) : (
                    <Skeleton className="w-1/2 h-5" />
                  )}
                </p>
                <p className="flex justify-between items-center">
                  <strong>{t("Is Taken")}:</strong>{" "}
                  {isDetailLoading ? (
                    <Skeleton className="w-1/2 h-5" />
                  ) : bookDetail?.data?.isTaken ? (
                    t("Active")
                  ) : (
                    t("No Active")
                  )}
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};
