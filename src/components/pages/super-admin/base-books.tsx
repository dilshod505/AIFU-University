"use client";

import DeleteActionDialog from "@/components/delete-action-dialog";
import {
  useBaseBook,
  useBaseBookId,
  useCreateBaseBook,
  useDeleteBaseBook,
  useUpdateBaseBook,
} from "@/components/models/queries/base-book";
import { useBaseBooksCategory } from "@/components/models/queries/base-books-category";
import MyTable, { IColumn } from "@/components/my-table";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Divider, Form, Input, InputNumber, Modal, Select } from "antd";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  PenSquareIcon,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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

  const { data: detailData, isLoading: detailLoading } = useBaseBookId(
    selectedId,
    {
      enabled: !!selectedId,
    }
  );

  const [editingBook, setEditingCategory] = useState<Record<
    string,
    any
  > | null>(null);
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
                setEditingCategory(record);
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
    if (editingBook) {
      reset({
        categoryId: editingBook.category?.id || "",
        author: editingBook.author || "",
        series: editingBook.series || "",
        title: editingBook.title || "",
        publicationYear: editingBook.publicationYear || "",
        publisher: editingBook.publisher || "",
        publicationCity: editingBook.publicationCity || "",
        isbn: editingBook.isbn || "",
        pageCount: editingBook.pageCount || "",
        language: editingBook.language || "",
        udc: editingBook.udc || "",
      });
    } else {
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
      });
    }
  }, [editingBook, reset]);

  const onSubmit = async (formData: any) => {
    const payload = {
      ...formData,
      category: Number(formData.categoryId),
      publicationYear: Number(formData.publicationYear),
      pageCount: Number(formData.pageCount),
    };

    if (editingBook) {
      updateBook.mutate(
        { id: editingBook.id, ...payload },
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
                setEditingCategory(null);
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

      <Divider />

      {/* Add/Edit Modal */}
      <Modal
        title={editingBook ? t("Edit book") : t("Add book")}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={800}
      >
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <h1 className={"text-base font-semibold mb-2"}>{t("Title")}</h1>
          <div className={"grid md:grid-cols-2 gap-3"}>
            <Form.Item label={t("Category")} required>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select {...field} style={{ width: "100%" }}>
                    {categories?.data?.map((cat: any) => (
                      <Option key={cat.id} value={cat.id}>
                        {cat.name}
                      </Option>
                    ))}
                  </Select>
                )}
              />
            </Form.Item>
            <Form.Item label={t("Author")} required>
              <Controller
                name="author"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
            <Form.Item label={t("Series")}>
              <Controller
                name="series"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
            <Form.Item label={t("Title")} required>
              <Controller
                name="title"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </div>

          <Divider />
          <h1 className={"text-base font-semibold mb-2"}>
            Publication Details
          </h1>
          <div className={"grid md:grid-cols-3 gap-3"}>
            <Form.Item label={t("Publication year")} required>
              <Controller
                name="publicationYear"
                control={control}
                render={({ field }) => (
                  <InputNumber {...field} style={{ width: "100%" }} />
                )}
              />
            </Form.Item>
            <Form.Item label={t("Publisher")} required>
              <Controller
                name="publisher"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
            <Form.Item label={t("Publication City")}>
              <Controller
                name="publicationCity"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </div>

          <Divider />
          <h1 className={"text-base font-semibold mb-2"}>
            Additional Information
          </h1>
          <div className={"grid md:grid-cols-2 gap-3"}>
            <Form.Item label={t("Isbn")}>
              <Controller
                name="isbn"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
            <Form.Item label={t("Page Count")} required>
              <Controller
                name="pageCount"
                control={control}
                render={({ field }) => (
                  <InputNumber {...field} style={{ width: "100%" }} />
                )}
              />
            </Form.Item>
            <Form.Item label={t("Language")} required>
              <Controller
                name="language"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
            <Form.Item label={t("UDC")}>
              <Controller
                name="udc"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </div>

          <div className="flex justify-end mt-4">
            <Button type="submit" className="bg-green-600 text-white">
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
            <SheetTitle>{t("Book detail")}</SheetTitle>
          </SheetHeader>

          <div className="p-3">
            <div className="space-y-4">
              <p className="flex justify-between items-center">
                <strong>{t("Id")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detailData?.data?.book?.id
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Title")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detailData?.data?.book?.title
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Author")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detailData?.data?.book?.author
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Category")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detailData?.data?.book?.category?.name
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Language")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detailData?.data?.book?.language
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Publisher")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detailData?.data?.book?.publisher
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Publication city")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detailData?.data?.book?.publicationCity
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Publication Year")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detailData?.data?.book?.publicationYear
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Total count")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detailData?.data?.totalCount
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("ISBN")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detailData?.data?.book?.isbn
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Udc")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detailData?.data?.book?.udc
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Seria")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detailData?.data?.book?.series || (
                    <h1 className={"text-red-600"}>--</h1>
                  )
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Page Count")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detailData?.data?.book?.pageCount
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Title details")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detailData?.data?.totalDetails || (
                    <h1 className={"text-red-600"}>mavjud emas</h1>
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
