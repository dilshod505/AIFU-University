"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  useBaseBook,
  useCreateBaseBook,
  useDeleteBaseBook,
  useUpdateBaseBook,
} from "@/components/models/queries/base-book";
import MyTable, { IColumn } from "@/components/my-table";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import TooltipBtn from "@/components/tooltip-btn";
import {
  ChevronLeft,
  ChevronRight,
  PenSquareIcon,
  Plus,
  Trash,
} from "lucide-react";
import { useBaseBooksCategory } from "@/components/models/queries/base-books-category";
import ReactPaginate from "react-paginate";
import { Divider, Form, Input, InputNumber, Modal, Select } from "antd";
import { Button } from "@/components/ui/button";
import {
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

const { Option } = Select;

const BaseBooks = () => {
  const t = useTranslations();
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [open, setOpen] = useState<boolean>(false);

  const { data: baseBooks, isLoading } = useBaseBook({
    pageNum,
    pageSize,
    searchQuery: debouncedSearchQuery || undefined,
  });
  const createBaseBook = useCreateBaseBook();
  const { data: categories } = useBaseBooksCategory();
  const deleteBook = useDeleteBaseBook();
  const updateBook = useUpdateBaseBook();

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
            <TooltipBtn
              variant={"destructive"}
              title={t("Delete")}
              size={"sm"}
              color={"red"}
              onClick={() => {
                deleteBook.mutate(record.id);
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

  const onSubmit = async (data: any) => {
    if (editingBook) {
      updateBook.mutate(data, {
        onSuccess: () => {
          setOpen(false);
          toast.success(t("Book updated successfully"));
        },
      });
    } else {
      createBaseBook.mutate(data, {
        onSuccess: () => {
          setOpen(false);
          toast.success(t("Book created successfully"));
        },
      });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold py-5">{t("Base books")}</h1>

      <MyTable
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
      />

      <Divider />

      <ReactPaginate
        breakLabel="..."
        onPageChange={(e) => setPageNum(e.selected + 1)}
        pageRangeDisplayed={pageSize}
        pageCount={Math.ceil((baseBooks?.data?.totalElements || 0) / pageSize)}
        previousLabel={
          <Button className="bg-white text-black">
            <ChevronLeft /> {t("Previous")}
          </Button>
        }
        nextLabel={
          <Button className="bg-white text-black">
            {t("Next")} <ChevronRight />
          </Button>
        }
        className="flex justify-center gap-2 items-center my-5"
        renderOnZeroPageCount={null}
        forcePage={pageNum - 1}
        pageClassName="px-3 py-1 rounded-full border cursor-pointer"
        activeClassName="bg-green-600 text-white rounded-full"
      />

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
    </div>
  );
};

export default BaseBooks;
