"use client";

import DeleteActionDialog from "@/components/delete-action-dialog";
import { useBaseBook } from "@/components/models/queries/base-book";
import {
  useCheckInventoryNumber,
  useCopiesBooks,
  useCopiesBooksId,
  useCreateCopiesBooks,
  useDeleteCopiesBooks,
  useUpdateCopiesBooks,
} from "@/components/models/queries/copies-books";
import MyTable, { type IColumn } from "@/components/my-table";
import TooltipBtn from "@/components/tooltip-btn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Button as AntButton,
  Input as AntInput,
  Divider,
  Form,
  Modal,
  Select,
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
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import ReactPaginate from "react-paginate";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterType } from "@/components/pages/super-admin/users";

const { TextArea } = AntInput;

export const CopiesBooks = () => {
  const t = useTranslations();
  const createCopiesBook = useCreateCopiesBooks();
  const deleteCategory = useDeleteCopiesBooks();
  const updateBook = useUpdateCopiesBooks();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [actionType, setActionType] = useState<"add" | "edit" | "view">("add");
  const [editingBook, setEditingBook] = useState<Record<string, any> | null>(
    null,
  );

  const checkInventoryNumber = useCheckInventoryNumber();

  const [pageSize, setPageSize] = useState<number>(10);
  const [pageNum, setPageNum] = useState<number>(1);

  const [searchQuery, setSearchQuery] = useState<string>("");
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

  const [filter, setFilter] = useState<FilterType>("all");

  const { data: copiesBooks, isLoading } = useCopiesBooks({
    pageSize,
    pageNumber: pageNum,
    query: debouncedSearchQuery,
    sortDirection,
    filter,
  });

  const { data: bookDetail, isLoading: isDetailLoading } = useCopiesBooksId({
    id: editingBook?.id,
  });

  const { data: baseBooks } = useBaseBook({ pageNum });

  const [open, setOpen] = useState<boolean>(false);
  const [open2, setOpen2] = useState<boolean>(false);
  const form = useForm();

  const [antdForm] = Form.useForm();

  const fields = useMemo<any[]>(
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
        label: t("epc"),
        name: "epc",
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
      },
      {
        title: t("Base Book"),
        key: "title",
        dataIndex: "title",
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
          </div>
        ),
      },
    ],
    [t, deleteCategory, pageNum, pageSize],
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
        epc: editingBook?.epc ?? bookDetail?.data?.epc, // 🔑 qo‘shib qo‘yamiz
      };
      form.reset(formData);
      antdForm.setFieldsValue(formData);
    }
  }, [bookDetail, form, editingBook, antdForm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setPageNum(1);
  };

  const onSubmit = async (data: any) => {
    checkInventoryNumber.mutate(data.inventoryNumber, {
      onSuccess: (res) => {
        if (res?.data) {
          toast.error(t("Bu inventory raqam allaqachon mavjud!"));
          return;
        }

        if (editingBook) {
          // ✏️ Update
          updateBook.mutate(
            {
              id: editingBook.id,
              inventoryNumber: data.inventoryNumber,
              shelfLocation: data.shelfLocation,
              notes: data.notes,
              epc: data.epc,
              book: data.baseBookId, // update uchun
            },
            {
              onSuccess: () => {
                toast.success(t("Kitob nusxasi yangilandi"));
                setOpen(false);
                antdForm.resetFields();
              },
              onError: (error: any) => {
                toast.error(
                  error?.response?.data?.message ||
                    t("Server bilan bog'lanishda xatolik"),
                );
              },
            },
          );
        } else {
          // ➕ Create
          createCopiesBook.mutate(
            {
              inventoryNumber: data.inventoryNumber,
              shelfLocation: data.shelfLocation,
              notes: data.notes,
              epc: data.epc,
              baseBookId: data.baseBookId, // create uchun
            },
            {
              onSuccess: () => {
                toast.success(t("Kitob nusxasi yaratildi"));
                setOpen(false);
                antdForm.resetFields();
              },
              onError: (error: any) => {
                toast.error(
                  error?.response?.data?.message ||
                    t("Server bilan bog'lanishda xatolik"),
                );
              },
            },
          );
        }
      },
      onError: () => {
        toast.error(t("Server bilan bog'lanishda xatolik"));
      },
    });
  };

  const renderFormField = (field: any) => {
    switch (field.type) {
      case "select":
        return (
          <Select
            placeholder={`${t("Select")} ${field.label}`}
            options={field.options}
            allowClear
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
            <Tabs
              value={filter}
              onValueChange={(a: string) => setFilter(a as any)}
            >
              <TabsList className="flex gap-2">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  {t("All")}
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  {t("Active")}
                </TabsTrigger>
                <TabsTrigger
                  value="inactive"
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  {t("Inactive")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div>
              <TooltipBtn
                size={"sm"}
                title={t("Add Book Copy")}
                onClick={() => {
                  setOpen(true);
                }}
              >
                <Plus />
                {t("Add Book Copy")}
              </TooltipBtn>
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
                onPageChange={(e) => {
                  const newPageNum = e.selected + 1;
                  setPageNum(newPageNum);
                }}
                pageRangeDisplayed={pageSize}
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

      {/* Add/Edit Modal - CHANGED from Sheet to antd Modal */}
      {(actionType === "add" || actionType === "edit") && (
        <Modal
          title={
            actionType === "add"
              ? t("Add Book Copy")
              : actionType === "edit"
                ? t("Edit Book Copy")
                : ""
          }
          open={open}
          onCancel={() => {
            setOpen(false);
            setActionType("add");
            setEditingBook(null);
            antdForm.resetFields();
          }}
          footer={null}
          width={600}
          destroyOnClose
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
                <AntButton
                  type="primary"
                  htmlType="submit"
                  loading={createCopiesBook.isPending || updateBook.isPending}
                >
                  {editingBook ? t("Edit book copy") : t("Add book copy")}
                </AntButton>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      )}

      {/* View Modal - CHANGED from Sheet to antd Modal */}
      {actionType === "view" && (
        <Modal
          title={t("Book Copy Detail")}
          open={open2}
          onCancel={() => {
            setOpen2(false);
            setActionType("add");
            setEditingBook(null);
          }}
          footer={[
            <AntButton
              key="close"
              onClick={() => {
                setOpen2(false);
                setActionType("add");
                setEditingBook(null);
              }}
            >
              {t("Close")}
            </AntButton>,
          ]}
          width={500}
        >
          <div className="space-y-4 mt-4">
            <p className={"flex justify-between items-center"}>
              <strong>{t("Inventory Number")}:</strong>{" "}
              {!isDetailLoading ? (
                bookDetail?.data?.inventoryNumber
              ) : (
                <Skeleton className="w-1/2 h-5" />
              )}
            </p>
            <p className={"flex justify-between items-center"}>
              <strong>{t("Shelf Location")}:</strong>{" "}
              {!isDetailLoading ? (
                bookDetail?.data?.shelfLocation
              ) : (
                <Skeleton className="w-1/2 h-5" />
              )}
            </p>
            <p className={"flex justify-between items-center"}>
              <strong>{t("Notes")}:</strong>{" "}
              {!isDetailLoading ? (
                bookDetail?.data?.notes
              ) : (
                <Skeleton className="w-1/2 h-5" />
              )}
            </p>
            <p className={"flex justify-between items-center"}>
              <strong>{t("Base Book")}:</strong>{" "}
              {!isDetailLoading ? (
                bookDetail?.data?.baseBookId
              ) : (
                <Skeleton className="w-1/2 h-5" />
              )}
            </p>
            <p className="flex justify-between items-center">
              <strong>{t("Is Taken")}:</strong>{" "}
              {isDetailLoading ? (
                <Skeleton className="w-1/2 h-5" />
              ) : bookDetail?.data?.isTaken ? (
                <BookOpenCheck className="text-green-600 w-5 h-5" />
              ) : (
                <BookMinus className="text-red-500 w-5 h-5" />
              )}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
