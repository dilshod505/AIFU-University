"use client";

import DeleteActionDialog from "@/components/delete-action-dialog";
import {
  useCheckInventoryNumber,
  useCopiesBooks,
  useCopiesBooksId,
  useCopiesSelectOptions,
  useCreateCopiesBooks,
  useDeleteCopiesBooks,
  useUpdateCopiesBooks,
} from "@/components/models/queries/copies-books"; // Import from our enhanced hook
import MyTable, { type IColumn } from "@/components/my-table";
import TooltipBtn from "@/components/tooltip-btn";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import useLayoutStore from "@/store/layout-store";
import {
  Button as AntButton,
  Select as AntdSelect,
  Input as AntInput,
  Divider,
  Form,
  Input,
  Modal,
} from "antd";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  BookMinus,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  PenSquareIcon,
  Plus,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import ReactPaginate from "react-paginate";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const { TextArea } = AntInput;

export const CopiesBooks = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [firstQuery, setFirstQuery] = useState<string>("");
  const [secondQuery, setSecondQuery] = useState<string>("");

  const [pageNum, setPageNum] = useState<number>(
    Number(searchParams.get("page")) || 1,
  );
  const handlePageChange = (newPage: number) => {
    setPageNum(newPage);

    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());

    router.push(`?${params.toString()}`);
  };

  const t = useTranslations();
  const { data: categoriesOptions } = useCopiesSelectOptions();
  const createCopiesBook = useCreateCopiesBooks();
  const deleteCategory = useDeleteCopiesBooks();
  const updateBook = useUpdateCopiesBooks();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [actionType, setActionType] = useState<"add" | "edit" | "view">("add");
  const [editingBook, setEditingBook] = useState<Record<string, any> | null>(
    null,
  );

  const { user } = useLayoutStore();
  const role = user?.role?.toString().toLowerCase().replace("_", "-");

  // --- yangi state

  const checkInventoryNumber = useCheckInventoryNumber();

  const [pageSize, setPageSize] = useState<number>(10);
  // const [pageNum, setPageNum] = useState<number>(1);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    useState<string>(searchQuery);

  const [searchField, setSearchField] = useState<
    "book" | "inventoryNumber" | "fullInfo" | "epc" | "fullName"
  >("inventoryNumber");

  useEffect(() => {
    const timer = setTimeout(() => {
      let fullQuery = "";

      if (searchField === "fullInfo") {
        const author = firstQuery.trim();
        const title = secondQuery.trim();

        if (author || title) {
          fullQuery = `${author}${author && title ? "~" : ""}~${title}`;
        }
      } else {
        fullQuery = searchQuery.trim();
      }

      setDebouncedSearchQuery(fullQuery);
      setSearchQuery(fullQuery); // 🔥 Asosiy fix shu
      setPageNum(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, firstQuery, secondQuery, searchField]);

  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const { data: copiesBooks, isLoading } = useCopiesBooks({
    pageSize,
    pageNumber: pageNum,
    query: searchQuery || debouncedSearchQuery,
    searchField,
    sortDirection,
    filter,
  });

  useEffect(() => {
    const bookId = searchParams.get("bookId");
    if (bookId) {
      setSearchField("book");
      setSearchQuery(bookId);
    }
  }, [searchParams]);

  useEffect(() => {
    const bookId = searchParams.get("bookId");
    if (bookId && searchQuery.trim() === "") {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("bookId"); // URL’dan olib tashlash
      router.replace(`${pathname}?${params.toString()}`);
    }

    // Agar kimdir inputga "bookId" so‘zini yozsa, tozalab yuborish (oldini olish)
    if (searchQuery.toLowerCase() === "bookid") {
      setSearchQuery("");
      const params = new URLSearchParams(searchParams.toString());
      params.delete("bookId");
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [searchQuery, searchParams, pathname, router]);

  // --- buildSearchParams ga yuborish uchun
  // useEffect(() => {
  //   if (searchField === "fullInfo" || searchField === "fullName") {
  //     if (firstQuery || secondQuery) {
  //       setDebouncedSearchQuery(
  //         `${firstQuery}${secondQuery ? `~${secondQuery}` : ""}`,
  //       );
  //     } else {
  //       setDebouncedSearchQuery("");
  //     }
  //   } else {
  //     const timer = setTimeout(() => {
  //       setDebouncedSearchQuery(searchQuery);
  //       if (searchQuery !== debouncedSearchQuery) {
  //         setPageNum(1);
  //       }
  //     }, 500);
  //     return () => clearTimeout(timer);
  //   }
  // }, [searchQuery, firstQuery, secondQuery, searchField]);

  const columns = useMemo<IColumn[]>(
    () => [
      {
        title: "#",
        key: "index",
        dataIndex: "index",
        width: 200,
        render: (_: any, __: any, index: number) =>
          (pageNum - 1) * pageSize + index + 1,
      },
      {
        title: t("Author"),
        key: "author",
        dataIndex: "author",
        render: (text: string) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="block max-w-[160px] truncate cursor-pointer">
                  {text || <span className="text-red-500">--</span>}
                </span>
              </TooltipTrigger>
              {text && (
                <TooltipContent className="max-w-sm whitespace-pre-wrap">
                  {text}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        title: t("Title"),
        key: "title",
        dataIndex: "title",
        render: (text: string) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="block max-w-[160px] truncate cursor-pointer">
                  {text || <span className="text-red-500">--</span>}
                </span>
              </TooltipTrigger>
              {text && (
                <TooltipContent className="max-w-sm whitespace-pre-wrap">
                  {text}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        title: t("Inventory Number"),
        key: "inventoryNumber",
        dataIndex: "inventoryNumber",
      },
      {
        title: t("Shelf Location"),
        key: "shelfLocation",
        dataIndex: "shelfLocation",
        render: (text: string) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="block max-w-[160px] truncate cursor-pointer">
                  {text || <span className="text-red-500">--</span>}
                </span>
              </TooltipTrigger>
              {text && (
                <TooltipContent className="max-w-sm whitespace-pre-wrap">
                  {text}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        title: t("status"),
        key: "isTaken",
        dataIndex: "isTaken",
        render: (value: boolean) => (
          <div className="flex items-center justify-start">
            {value ? (
              <BookOpenCheck className="text-green-600 w-5 h-5" />
            ) : (
              <BookMinus className="text-red-500 w-5 h-5" />
            )}
          </div>
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
                setEditingBook(record);
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
                setEditingBook(record);
                setOpen(true);
                setOpen2(false);
              }}
            >
              <PenSquareIcon />
            </TooltipBtn>

            {role === "super-admin" && (
              <DeleteActionDialog
                onConfirm={() => {
                  deleteCategory.mutate(record.id, {
                    onSuccess: () =>
                      toast.success(t("Category deleted successfully")),
                    onError: () => toast.error(t("Error deleting category")),
                  });
                }}
                title={t("Delete")}
              />
            )}
          </div>
        ),
      },
    ],
    [t, pageNum, pageSize, role, deleteCategory],
  );

  const { data: bookDetail, isLoading: isDetailLoading } = useCopiesBooksId({
    id: editingBook?.id,
  });

  const [open, setOpen] = useState<boolean>(false);
  const [open2, setOpen2] = useState<boolean>(false);
  const form = useForm();

  const [antdForm] = Form.useForm();

  const fields = useMemo<any[]>(
    () => [
      {
        label: t("Book"),
        name: "baseBookId",
        type: "select",
        required: true,
        options: categoriesOptions?.data?.map((cat: Record<string, any>) => ({
          value: cat.id,
          label: `${cat.id}. ${cat.author} - ${cat.title}`,
        })),
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
        required: false,
      },
      {
        label: t("epc"),
        name: "epc",
        type: "text",
        required: false,
      },
      {
        label: t("Notes"),
        name: "notes",
        type: "textarea",
        required: false,
      },
    ],
    [t, categoriesOptions],
  );

  useEffect(() => {
    if (!editingBook && actionType === "add" && open) {
      form.reset({
        inventoryNumber: "",
        shelfLocation: "",
        notes: "",
        baseBookId: "",
        epc: "",
      });
      antdForm.resetFields();
    }
  }, [editingBook, open, form, actionType, antdForm]);

  useEffect(() => {
    if (editingBook) {
      const formData = {
        ...bookDetail?.data,
        ...editingBook,
        baseBookId: bookDetail?.data?.baseBookId,
        epc: editingBook?.epc ?? bookDetail?.data?.epc,
      };
      form.reset(formData);
      antdForm.setFieldsValue(formData);
    }
  }, [bookDetail, form, editingBook, antdForm]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", pageNum.toString());
    router.push(`?${params.toString()}`);
  }, [pageNum]);

  // const searchFieldOptions = [
  //   { value: "inventoryNumber", label: t("Inventory Number") },
  //   { value: "book", label: t("Book") },
  //   { value: "fullInfo", label: t("Full Info") },
  //   { value: "epc", label: t("epc") },
  //   { value: "fullName", label: t("Full name") },
  // ];

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data: any) => {
    setSubmitting(true);

    if (editingBook) {
      updateBook.mutate(
        {
          id: editingBook.id,
          inventoryNumber: data.inventoryNumber,
          shelfLocation: data.shelfLocation,
          notes: data.notes,
          epc: data.epc,
          baseBookId: data.baseBookId, // update uchun
        },
        {
          onSuccess: () => {
            toast.success(t("Kitob nusxasi yangilandi"));
            setSubmitting(false);
            setOpen(false);
            antdForm.resetFields();
          },
          onError: (error: any) => {
            toast.error(
              error?.response?.data?.message ||
                t("Server bilan bog'lanishda xatolik"),
            );
            setSubmitting(false);
          },
        },
      );
    } else {
      // ➕ Create
      checkInventoryNumber.mutate(data.inventoryNumber, {
        onSuccess: (res) => {
          if (res?.data) {
            toast.error(t("Bu inventory raqam allaqachon mavjud!"));
            setSubmitting(false);
            return;
          }

          createCopiesBook.mutate(
            {
              inventoryNumber: data.inventoryNumber,
              shelfLocation: data.shelfLocation,
              notes: data.notes,
              epc: data.epc,
              baseBookId: data.baseBookId,
            },
            {
              onSuccess: () => {
                toast.success(t("Kitob nusxasi yaratildi"));
                setSubmitting(false);
                setOpen(false);
                antdForm.resetFields();
              },
              onError: (error: any) => {
                toast.error(
                  error?.response?.data?.message ||
                    t("Server bilan bog'lanishda xatolik"),
                );
                setSubmitting(false);
              },
            },
          );
        },
        onError: () => {
          toast.error(t("Server bilan bog'lanishda xatolik"));
          setSubmitting(false);
        },
      });
    }
  };

  const renderFormField = (field: any) => {
    switch (field.type) {
      case "select":
        return (
          <AntdSelect
            showSearch
            style={{ width: "100%" }}
            placeholder={field.label}
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label ?? "")
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            options={field.options || []}
          />
        );
      case "textarea":
        return <TextArea placeholder={field.label} rows={4} />;
      default:
        return <AntInput placeholder={field.label} />;
    }
  };

  return (
    <div>
      <MyTable
        title={
          <h1 className={"text-2xl font-semibold"}>{t("Copies books")}</h1>
        }
        pagination={false}
        isLoading={isLoading}
        columns={columns}
        dataSource={copiesBooks?.data?.list || []}
        header={
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {/* Search Bar Container */}
              <div className="flex-1 rounded-full shadow-lg p-1 flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <TooltipBtn
                      className="flex-shrink-0 mr-1 p-2.5 rounded-full transition-colors"
                      title={t("Filter")}
                    >
                      <Settings2 size={18} />
                    </TooltipBtn>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="52">
                    <DropdownMenuItem
                      onClick={() => {
                        setSearchField("inventoryNumber");
                        setSearchQuery("");
                        setFirstQuery("");
                        setSecondQuery("");
                      }}
                      className={
                        searchField === "inventoryNumber" ? "bg-blue-50" : ""
                      }
                    >
                      {t("Inventory Number search")}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => {
                        setSearchField("fullInfo");
                        setSearchQuery("");
                        setFirstQuery("");
                        setSecondQuery("");
                      }}
                      className={searchField === "fullInfo" ? "bg-blue-50" : ""}
                    >
                      {t("Author/Title search")}
                    </DropdownMenuItem>

                    {/*<DropdownMenuItem*/}
                    {/*  onClick={() => {*/}
                    {/*    setSearchField("fullName");*/}
                    {/*    setSearchQuery("");*/}
                    {/*    setFirstQuery("");*/}
                    {/*    setSecondQuery("");*/}
                    {/*  }}*/}
                    {/*  className={searchField === "fullName" ? "bg-blue-50" : ""}*/}
                    {/*>*/}
                    {/*  {t("Reader Full Name search")}*/}
                    {/*</DropdownMenuItem>*/}

                    <DropdownMenuItem
                      onClick={() => {
                        setSearchField("epc");
                        setSearchQuery("");
                        setFirstQuery("");
                        setSecondQuery("");
                      }}
                      className={searchField === "epc" ? "bg-blue-50" : ""}
                    >
                      {t("EPC bo'yicha qidirish")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Input Fields */}
                <div className="flex-1 flex items-center gap-3 px-2">
                  {searchField === "fullInfo" || searchField === "fullName" ? (
                    <>
                      <input
                        type="text"
                        placeholder={t("Author")}
                        value={firstQuery}
                        onChange={(e) => setFirstQuery(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
                      />
                      <div className="w-px h-5 bg-gray-300"></div>
                      <input
                        type="text"
                        placeholder={t("Title")}
                        value={secondQuery}
                        onChange={(e) => setSecondQuery(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
                      />
                    </>
                  ) : (
                    <input
                      type="text"
                      placeholder={t("Search")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm w-90 dark:text-white"
                    />
                  )}
                </div>

                {/* Search Button */}
                <TooltipBtn
                  className="flex-shrink-0 mr-1 p-2.5 rounded-full transition-colors"
                  title={t("Search")}
                >
                  <Search size={18} />
                </TooltipBtn>
              </div>

              {/* Sort + Add */}
              <div className="flex gap-2">
                {sortDirection === "asc" ? (
                  <TooltipBtn
                    size="sm"
                    onClick={() => setSortDirection("desc")}
                  >
                    <ArrowUpWideNarrow />
                  </TooltipBtn>
                ) : (
                  <TooltipBtn size="sm" onClick={() => setSortDirection("asc")}>
                    <ArrowDownWideNarrow />
                  </TooltipBtn>
                )}

                <TooltipBtn
                  size="sm"
                  title={t("Add Book Copy")}
                  onClick={() => setOpen(true)}
                >
                  <Plus /> {t("Add Book Copy")}
                </TooltipBtn>
              </div>
            </div>
          </div>
        }
        footer={
          <div
            className={
              "flex flex-col lg:flex-row justify-between items-center gap-2"
            }
          >
            <div className="font-bold text-[20px] space-y-1 flex items-center gap-5">
              <p className="text-sm whitespace-break-spaces">
                {t("Total Pages")}:{" "}
                <span className="text-green-600">
                  {copiesBooks?.data?.totalPages}
                </span>
              </p>
              <p className="text-sm whitespace-break-spaces">
                {t("Current Page")}:{" "}
                <span className="text-green-600">
                  {copiesBooks?.data?.currentPage}
                </span>
              </p>
              <p className="text-sm whitespace-break-spaces">
                {t("Total Elements")}:{" "}
                <span className="text-green-600">
                  {copiesBooks?.data?.totalElements}
                </span>
              </p>
            </div>

            <div>
              <ReactPaginate
                breakLabel="..."
                onPageChange={(e) => handlePageChange(e.selected + 1)}
                pageRangeDisplayed={3}
                marginPagesDisplayed={1}
                pageCount={Math.ceil(
                  (copiesBooks?.data?.totalElements || 0) / pageSize,
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
                forcePage={pageNum - 1}
                pageClassName="list-none"
                pageLinkClassName="px-3 py-1 rounded-full border cursor-pointer block"
                activeLinkClassName="bg-green-600 text-white rounded-full"
              />
            </div>
          </div>
        }
      />
      <Divider />
      {/* ... existing modal code remains the same ... */}
      {(actionType === "add" || actionType === "edit") && (
        <Modal
          title={
            actionType === "add" ? t("Add Book Copy") : t("Edit Book Copy")
          }
          open={open}
          onCancel={() => {
            setOpen(false);
            setActionType("add");
            setEditingBook(null);
            antdForm.resetFields();
          }}
          footer={null}
          width={700}
          centered
        >
          <Form
            form={antdForm}
            layout="vertical"
            onFinish={onSubmit}
            className="mt-4"
          >
            {fields.map((field) => (
              <Form.Item
                key={field.name}
                label={field.label}
                name={field.name}
                rules={[
                  {
                    required: field.required,
                    message: `${field.label} ${t("is required")}`,
                  },
                ]}
              >
                {renderFormField(field)}
              </Form.Item>
            ))}

            <Form.Item className="mb-0 mt-6">
              <div className="flex gap-2 justify-end">
                <AntButton
                  onClick={() => {
                    setOpen(false);
                    setActionType("add");
                    setEditingBook(null);
                    antdForm.resetFields();
                  }}
                >
                  {t("Cancel")}
                </AntButton>
                <Button
                  loading={
                    submitting ||
                    createCopiesBook.isPending ||
                    updateBook.isPending
                  }
                >
                  {editingBook ? t("Edit book copy") : t("Add book copy")}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      )}
      {actionType === "view" && (
        <Sheet open={open2} onOpenChange={setOpen2}>
          <SheetContent className="hide-scroll" side={"center"}>
            <SheetHeader className="flex justify-center items-center text-[20px]">
              <SheetTitle>{t("Copy Book Detail")}</SheetTitle>
            </SheetHeader>

            <div className="p-3">
              <div className="space-y-4">
                <p className="flex justify-between items-center">
                  <strong>{t("Author")}:</strong>{" "}
                  {isDetailLoading ? (
                    <Skeleton className="w-1/2 h-5" />
                  ) : (
                    (bookDetail?.data?.author ?? "-")
                  )}
                </p>
                <p className="flex justify-between items-center">
                  <strong>{t("Title")}:</strong>{" "}
                  {isDetailLoading ? (
                    <Skeleton className="w-1/2 h-5" />
                  ) : (
                    (bookDetail?.data?.title ?? "-")
                  )}
                </p>
                <p className="flex justify-between items-center">
                  <strong>{t("Inventory Number")}:</strong>{" "}
                  {isDetailLoading ? (
                    <Skeleton className="w-1/2 h-5" />
                  ) : (
                    (bookDetail?.data?.inventoryNumber ?? "-")
                  )}
                </p>
                <p className="flex justify-between items-center">
                  <strong>{t("shelfLocation")}:</strong>{" "}
                  {isDetailLoading ? (
                    <Skeleton className="w-1/2 h-5" />
                  ) : (
                    (bookDetail?.data?.shelfLocation ?? "-")
                  )}
                </p>
                <p className="flex justify-between items-center">
                  <strong>{t("Notes")}:</strong>{" "}
                  {isDetailLoading ? (
                    <Skeleton className="w-1/2 h-5" />
                  ) : (
                    (bookDetail?.data?.notes ?? "-")
                  )}
                </p>
                <p className="flex justify-between items-center">
                  <strong>{t("Epc")}:</strong>{" "}
                  {isDetailLoading ? (
                    <Skeleton className="w-1/2 h-5" />
                  ) : bookDetail?.data?.epc?.trim() ? (
                    bookDetail.data.epc
                  ) : (
                    "-"
                  )}
                </p>
                <p className="flex justify-between items-center">
                  <strong>{t("Status")}:</strong>{" "}
                  {isDetailLoading ? (
                    <Skeleton className="w-1/2 h-5" />
                  ) : (
                    (bookDetail?.data?.status ?? "-")
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
