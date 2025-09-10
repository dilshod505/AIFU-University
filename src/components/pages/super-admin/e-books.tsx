"use client";

import DeleteActionDialog from "@/components/delete-action-dialog";
import { api } from "@/components/models/axios";
import MyTable, { type IColumn } from "@/components/my-table";
import TooltipBtn from "@/components/tooltip-btn";
import { Button } from "@/components/ui/button";
import { Input as ShadcnInput } from "@/components/ui/input";
import { UploadOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button as AntButton,
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Upload,
} from "antd";
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
import ReactPaginate from "react-paginate";
import { toast } from "sonner";

const { TextArea } = Input;
const { Option } = Select;

const initialValues: Record<string, any> = {
  imageUrl: "",
  pdfUrl: "",
  author: "",
  categoryId: undefined,
  titleDetails: "",
  title: "",
  publicationYear: "",
  isbn: "",
  pageCount: 1,
  publisher: "",
  language: "",
  script: "",
  description: "",
};

const EBaseBooks = () => {
  const t = useTranslations();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    useState<string>(searchQuery);
  const [actionType, setActionType] = useState<"add" | "edit" | "view">("add");
  const [form] = Form.useForm();
  const [editingBook, setEditingBook] = useState<Record<string, any> | null>(
    null,
  );
  const [uploadedImage, setUploadedImage] = useState<any>(null);
  const [uploadedPdf, setUploadedPdf] = useState<any>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

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
        `/admin/pdf-books?pageNumber=${pageNumber}&pageSize=10&sortDirection=${sortDirection}${searchQuery ? `&query=${searchQuery}&field=fullInfo` : ""}`,
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
      const res = await api.patch(`/admin/pdf-books/${id}`, {
        ...data,
        id: undefined,
      });
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

  useEffect(() => {
    if (editingBook && getById.data?.data && !getById.isLoading) {
      const bookData = getById.data.data;
      form.setFieldsValue({
        ...bookData,
        categoryId: bookData.categoryPreview?.id
          ? Number(bookData.categoryPreview.id)
          : undefined,
      });
      if (bookData.imageUrl) {
        setUploadedImage({ url: bookData.imageUrl });
      }
      if (bookData.pdfUrl) {
        setUploadedPdf({ url: bookData.pdfUrl });
      }
    }
  }, [editingBook, getById.data, getById.isLoading, form]);

  const onSubmit = async (values: any) => {
    try {
      if (editingBook) {
        updateBook.mutate({
          id: editingBook.id,
          data: {
            ...values,
            imageUrl:
              typeof values.imageUrl === "string"
                ? values.imageUrl
                : values.imageUrl?.file?.response?.url || values.imageUrl,
            pdfUrl:
              typeof values.pdfUrl === "string"
                ? values.pdfUrl
                : values.pdfUrl?.file?.response?.url || values.pdfUrl,
            size:
              typeof values.size === "number"
                ? values.size
                : values.pdfUrl?.sizeMB,
          },
        });
      } else {
        createBook.mutate({
          ...values,
          imageUrl:
            typeof values.imageUrl === "string"
              ? values.imageUrl
              : values.imageUrl?.file?.response?.url,
          pdfUrl:
            typeof values.pdfUrl === "string"
              ? values.pdfUrl
              : values.pdfUrl?.file?.response?.url,
          size: values.pdfUrl?.sizeMB,
        });
      }
      setOpen(false);
      setEditingBook(null);
      setActionType("add");
      form.resetFields();
      setUploadedImage(null);
      setUploadedPdf(null);
    } catch (e) {
      console.log(e);
    }
  };

  const handleUpload = (info: any, fieldName: string) => {
    if (info.file.status === "uploading") {
      return;
    }
    if (info.file.status === "done") {
      message.success(`${info.file.name} file uploaded successfully`);
      const uploadedUrl =
        info.file.response?.data?.url || info.file.response?.data;

      // Update form field
      form.setFieldsValue({
        [fieldName]: uploadedUrl,
      });

      // Update upload state for validation
      if (fieldName === "imageUrl") {
        setUploadedImage(info.file);
      } else if (fieldName === "pdfUrl") {
        setUploadedPdf(info.file);
      }

      // Trigger validation for the field
      form.validateFields([fieldName]);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const validateImageUpload = (_: any, value: any) => {
    if (actionType === "edit" && editingBook?.imageUrl) {
      return Promise.resolve();
    }
    if (uploadedImage || value) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(t("Please upload book cover")));
  };

  const validatePdfUpload = (_: any, value: any) => {
    if (actionType === "edit" && editingBook?.pdfUrl) {
      return Promise.resolve();
    }
    if (uploadedPdf || value) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(t("Please upload PDF file")));
  };

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
    [deleteBook, t],
  );

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
              <ShadcnInput
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
                  setUploadedImage(null);
                  setUploadedPdf(null);
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
                  (books?.data?.totalElements || 0) / pageSize,
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
      <Modal
        open={open}
        onCancel={() => {
          setEditingBook(null);
          setActionType("add");
          form.resetFields();
          setOpen(false);
          setUploadedImage(null);
          setUploadedPdf(null);
        }}
        footer={null}
        width={800}
        className="rounded-xl hide-scroll bg-white dark:bg-background"
        title={
          <h1 className="text-xl font-bold">
            {actionType === "add"
              ? t("Add e-book")
              : actionType === "edit"
                ? t("Edit e-book")
                : t("Book Details")}
          </h1>
        }
      >
        <div className="py-1">
          {actionType === "view" ? (
            <div className="space-y-6">
              {getById.isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : getById.data?.data ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Image
                      height={400}
                      width={400}
                      src={getById.data.data.imageUrl || "/placeholder.svg"}
                      alt={getById.data.data.title}
                      className="w-full h-[200px] object-cover bg-center rounded-lg shadow-lg"
                    />
                    <div className="text-center">
                      <AntButton
                        onClick={() =>
                          window.open(getById.data.data.pdfUrl, "_blank")
                        }
                        className="w-full"
                        type="primary"
                      >
                        {t("Open PDF")}
                      </AntButton>
                    </div>
                  </div>

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
                          "DD-MM-YYYY",
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
                <AntButton onClick={() => setOpen(false)}>
                  {t("close")}
                </AntButton>
              </div>
            </div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={onSubmit}
              initialValues={initialValues}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label={t("kitob muqovasi")}
                  name="imageUrl"
                  rules={[
                    {
                      validator: validateImageUpload,
                    },
                  ]}
                >
                  <Upload
                    name="image"
                    listType="picture"
                    maxCount={1}
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(info) => handleUpload(info, "imageUrl")}
                  >
                    <AntButton icon={<UploadOutlined />}>
                      {t("Upload Image")}
                    </AntButton>
                  </Upload>
                </Form.Item>

                <Form.Item
                  label={t("elektron kitob fayli")}
                  name="pdfUrl"
                  rules={[
                    {
                      validator: validatePdfUpload,
                    },
                  ]}
                >
                  <Upload
                    name="pdf"
                    maxCount={1}
                    accept="application/pdf"
                    onChange={(info) => handleUpload(info, "pdfUrl")}
                  >
                    <AntButton icon={<UploadOutlined />}>
                      {t("Upload PDF")}
                    </AntButton>
                  </Upload>
                </Form.Item>

                <Form.Item
                  label={t("Author")}
                  name="author"
                  rules={[
                    {
                      required: true,
                      message: t("Please enter author name"),
                    },
                  ]}
                >
                  <Input placeholder={t("Enter author name")} />
                </Form.Item>

                <Form.Item
                  label={t("Category")}
                  name="categoryId"
                  rules={[
                    { required: true, message: t("Please select category") },
                  ]}
                >
                  <Select
                    placeholder={t("Select category")}
                    loading={categories.isLoading}
                  >
                    {categories?.data?.map((category: Record<string, any>) => (
                      <Select.Option key={category.id} value={category.id}>
                        {category.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label={t("Title")}
                  name="title"
                  rules={[{ required: true, message: t("Please enter title") }]}
                >
                  <Input placeholder={t("Enter book title")} />
                </Form.Item>

                <Form.Item
                  label={t("Publication Year")}
                  name="publicationYear"
                  rules={[
                    {
                      required: true,
                      message: t("Please enter publication year"),
                    },
                  ]}
                >
                  <InputNumber
                    placeholder={t("Enter publication year")}
                    max={new Date().getFullYear()}
                    min={1000}
                    className="w-full"
                  />
                </Form.Item>

                <Form.Item
                  label={t("Isbn")}
                  name="isbn"
                  rules={[{ required: true, message: t("Please enter ISBN") }]}
                >
                  <Input placeholder={t("Enter ISBN")} />
                </Form.Item>

                <Form.Item
                  label={t("Page Count")}
                  name="pageCount"
                  rules={[
                    { required: true, message: t("Please enter page count") },
                  ]}
                >
                  <InputNumber
                    placeholder={t("Enter page count")}
                    min={1}
                    className="w-full"
                  />
                </Form.Item>

                <Form.Item
                  label={t("Publisher")}
                  name="publisher"
                  rules={[
                    { required: true, message: t("Please enter publisher") },
                  ]}
                >
                  <Input placeholder={t("Enter publisher")} />
                </Form.Item>

                <Form.Item
                  label={t("Language")}
                  name="language"
                  rules={[
                    { required: true, message: t("Please enter language") },
                  ]}
                >
                  <Input placeholder={t("Enter language")} />
                </Form.Item>

                <Form.Item
                  label={t("kitob qaysi tilda yozilgan")}
                  name="script"
                  rules={[
                    { required: true, message: t("Please enter script") },
                  ]}
                >
                  <Input placeholder={t("Enter script")} />
                </Form.Item>

                <Form.Item
                  label={t("Description")}
                  name="description"
                  rules={[
                    {
                      required: true,
                      message: t("Please enter description"),
                    },
                  ]}
                  className="md:col-span-2"
                >
                  <TextArea
                    rows={4}
                    placeholder={t("Enter book description")}
                  />
                </Form.Item>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <AntButton onClick={() => setOpen(false)}>
                  {t("Cancel")}
                </AntButton>
                <AntButton
                  htmlType="submit"
                  type="primary"
                  loading={createBook.isPending || updateBook.isPending}
                >
                  {actionType === "add" ? t("Add e-book") : t("Edit")}
                </AntButton>
              </div>
            </Form>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default EBaseBooks;
