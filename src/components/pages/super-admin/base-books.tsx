"use client";

import { TooltipContent } from "@/components/ui/tooltip";

import { TooltipTrigger } from "@/components/ui/tooltip";

import { Tooltip } from "@/components/ui/tooltip";

import DeleteActionDialog from "@/components/delete-action-dialog";
import { api } from "@/components/models/axios";
import {
  useBaseBook,
  useBaseBookId,
  useCreateBaseBook,
  useDeleteBaseBook,
  useUpdateBaseBook,
} from "@/components/models/queries/base-book";
import { useBaseBooksCategory } from "@/components/models/queries/base-books-category";
import MyTable, { type IColumn } from "@/components/my-table";
import TooltipBtn from "@/components/tooltip-btn";
import { Button } from "@/components/ui/button";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { Divider, Form, Input, InputNumber, Modal, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  PenSquareIcon,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import ReactPaginate from "react-paginate";
import { toast } from "sonner";

const { Option } = Select;

const BaseBooks = () => {
  const t = useTranslations();
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [open, setOpen] = useState<boolean>(false);
  const [form] = Form.useForm();

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: baseBooks, isLoading } = useBaseBook({
    pageNum,
    pageSize,
    searchQuery: debouncedSearchQuery || undefined,
  });
  const createBaseBook = useCreateBaseBook();
  const { data: categories } = useBaseBooksCategory();
  const deleteBook = useDeleteBaseBook();
  const updateBook = useUpdateBaseBook();
  const [editingBook, setEditingBook] = useState<string | null>(null);
  const baseBookDetail = useQuery({
    queryKey: ["base-book-detail", editingBook],
    queryFn: async () => {
      const res = await api.get(`/admin/base-books/${editingBook}`);
      return res.data;
    },
    enabled: !!editingBook,
    select: (data: Record<string, any>) => data?.data?.book,
  });

  const { data: detail, isLoading: detailLoading } = useBaseBookId(selectedId, {
    enabled: !!selectedId,
  });

  const { control, handleSubmit, reset } = useForm();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      if (searchQuery !== debouncedSearchQuery) {
        setPageNum(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearchQuery]);

  const columns = useMemo<IColumn[]>(
    () => [
      {
        key: "index",
        dataIndex: "index",
        title: "#",
        render: (_: any, __: any, index: number) => index + 1,
      },
      { key: "title", dataIndex: "title", title: t("Title") },
      { key: "author", dataIndex: "author", title: t("Author") },
      { key: "isbn", dataIndex: "isbn", title: t("Isbn") },
      {
        key: "totalCopies",
        dataIndex: "totalCopies",
        title: t("Total copies"),
      },
      {
        key: "takenCopies",
        dataIndex: "takenCopies",
        title: t("Taken copies"),
      },
      {
        key: "actions",
        dataIndex: "actions",
        title: t("actions"),
        width: 200,
        render: (_: any, record: any) => (
          <div className={"flex gap-2"}>
            <TooltipBtn
              variant={"ampersand"}
              title={t("Detail")}
              size={"sm"}
              onClick={() => {
                setSelectedId(record.id);
                setDetailOpen(true);
              }}
            >
              <Eye />
            </TooltipBtn>
            <TooltipBtn
              variant={"view"}
              title={t("Edit")}
              size={"sm"}
              onClick={() => {
                setEditingBook(record.id);
                setOpen(true);
              }}
            >
              <PenSquareIcon />
            </TooltipBtn>
            <DeleteActionDialog
              onConfirm={() => deleteBook.mutate(record.id)}
              title={t("Delete")}
            />
          </div>
        ),
      },
    ],
    [deleteBook, t]
  );

  useEffect(() => {
    console.log(baseBookDetail.data);

    if (editingBook) {
      form.setFieldsValue({
        ...baseBookDetail.data,
        categoryId: baseBookDetail?.data?.category?.id,
      });
    }
  }, [editingBook, form, baseBookDetail.isLoading]);

  const onSubmit = async (formData: any) => {
    const payload = {
      ...formData,
      titleDetails: formData.titleDetails || "",
      category: Number(formData.categoryId),
      publicationYear: Number(formData.publicationYear),
      pageCount: Number(formData.pageCount),
    };

    if (editingBook) {
      updateBook.mutate(
        { id: editingBook, ...payload },
        {
          onSuccess: () => {
            setOpen(false);
            toast.success(t("Book updated successfully"));
          },
        }
      );
    } else {
      createBaseBook.mutate(payload, {
        onSuccess: () => {
          setOpen(false);
          toast.success(t("Book created successfully"));
        },
      });
    }
  };

  return (
    <div>
      <TooltipProvider>
        <MyTable
          title={<h1 className="text-2xl font-semibold">{t("Base books")}</h1>}
          columns={columns}
          dataSource={baseBooks?.data?.data || []}
          isLoading={isLoading}
          pagination={false}
          header={
            <div className="flex justify-start items-center gap-2">
              <Input
                placeholder={t("search")}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select
                value={pageSize.toString()}
                onChange={(a: string) => setPageSize(Number(a))}
              >
                <SelectTrigger suppressHydrationWarning>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <SelectValue placeholder={pageSize} />
                      </TooltipTrigger>
                      <TooltipContent sideOffset={5}>
                        {t("select data size")}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <TooltipBtn
                size="sm"
                title={t("Add Book")}
                onClick={() => {
                  setEditingBook(null);
                  reset({
                    categoryId: "",
                    author: "",
                    series: "",
                    title: "",
                    publicationYear: "",
                    publisher: "",
                    publicationCity: "",
                    isbn: "",
                    pageCount: "",
                    language: "",
                    udc: "",
                    titleDetails: "",
                  });
                  setOpen(true);
                }}
              >
                <Plus /> {t("Add Book")}
              </TooltipBtn>
            </div>
          }
          footer={
            <div className={"flex justify-between items-center gap-2"}>
              <div className="font-bold text-[20px] space-y-1 flex items-center gap-5">
                <p className="text-sm text-start">
                  {t("Total Pages")}:{" "}
                  <span className="text-green-600">
                    {baseBooks?.data?.totalPages}
                  </span>
                </p>
                <p className="text-sm text-start">
                  {t("Current Page")}:{" "}
                  <span className="text-green-600">
                    {baseBooks?.data?.currentPage}
                  </span>
                </p>
                <p className="text-sm text-start">
                  {t("Total Elements")}:{" "}
                  <span className="text-green-600">
                    {baseBooks?.data?.totalElements}
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
                    (baseBooks?.data?.totalElements || 0) / pageSize
                  )}
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
                  className={"flex justify-center gap-2 items-center my-5"}
                  renderOnZeroPageCount={null}
                  forcePage={pageNum - 1}
                  pageClassName="px-3 py-1 rounded-full border cursor-pointer"
                  activeClassName="bg-green-600 text-white rounded-full"
                />
              </div>
            </div>
          }
        />
      </TooltipProvider>

      <Divider />

      {/* Add/Edit Modal */}
      <Modal
        title={editingBook ? t("Edit book") : t("Add book")}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <div className="grid md:grid-cols-2 gap-3">
            <Form.Item
              label={t("Title")}
              name="title"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={t("Author")}
              name="author"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              rules={[{ required: true }]}
              label={t("Series")}
              name="series"
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={t("Category")}
              name="categoryId"
              rules={[{ required: true }]}
            >
              <Select style={{ width: "100%" }}>
                {categories?.data?.map((cat: any) => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Divider />
          <h1 className="text-base font-semibold mb-2">
            {t("Publication Details")}
          </h1>
          <div className="grid md:grid-cols-3 gap-3">
            <Form.Item
              label={t("Publication year")}
              name="publicationYear"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label={t("Publisher")}
              name="publisher"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label={t("Publication City")} name="publicationCity">
              <Input />
            </Form.Item>
          </div>

          <Divider />
          <h1 className="text-base font-semibold mb-2">
            {t("Additional Information")}
          </h1>
          <div className="grid md:grid-cols-2 gap-3">
            <Form.Item label={t("Isbn")} name="isbn">
              <Input />
            </Form.Item>
            <Form.Item
              label={t("Page Count")}
              name="pageCount"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label={t("Language")}
              name="language"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label={t("UDC")} name="udc">
              <Input />
            </Form.Item>
            <Form.Item
              label={t("Title details")}
              name="titleDetails"
              rules={[{ required: true }]}
            >
              <TextArea rows={4} />
            </Form.Item>
          </div>

          <div className="flex justify-end mt-4">
            <Button className="bg-green-600 text-white">
              {editingBook ? t("Edit book") : t("Add book")}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Detail Sheet */}
      <Sheet
        open={detailOpen}
        onOpenChange={(v) => {
          setDetailOpen(v);
          if (!v) {
            setSelectedId(null);
          }
        }}
      >
        <SheetContent>
          <SheetHeader className="flex justify-center items-center text-[20px]">
            <SheetTitle>{t("book detail")}</SheetTitle>
          </SheetHeader>

          <div className="p-3">
            <div className="space-y-4">
              <p className="flex justify-between items-center">
                <strong>{t("id")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.id
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Title")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.title
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Author")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.author
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Category")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.category?.name
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Language")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.language
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Publisher")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.publisher
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Publication city")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.publicationCity
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Publication Year")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.publicationYear
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Total count")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.totalCount
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Isbn")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.isbn
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("UDC")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.udc
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Series")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.series || (
                    <h1 className={"text-red-600"}>--</h1>
                  )
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Page Count")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.pageCount
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Title details")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.titleDetails || (
                    <span className={"text-red-600"}>mavjud emas</span>
                  )
                )}
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default BaseBooks;
