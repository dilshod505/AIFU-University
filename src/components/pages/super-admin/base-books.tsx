"use client";

import DeleteActionDialog from "@/components/delete-action-dialog";
import { api } from "@/components/models/axios";
import {
  useAllExcelImport,
  useBaseBook,
  useBaseBookId,
  useCreateBaseBook,
  useDeleteBaseBook,
  useImportExcelBook,
  useUpdateBaseBook,
  useUploadExcelBook,
} from "@/components/models/queries/base-book";
import { useBaseBooksCategory } from "@/components/models/queries/base-books-category";
import MyTable, { type IColumn } from "@/components/my-table";
import TooltipBtn from "@/components/tooltip-btn";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useLayoutStore from "@/store/layout-store";
import { useQuery } from "@tanstack/react-query";
import {
  Button as AntButton,
  Select as AntdSelect,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  PenSquareIcon,
  Plus,
  Search,
  Settings2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { RiFileExcel2Line } from "react-icons/ri";
import ReactPaginate from "react-paginate";
import { toast } from "sonner";
import Link from "next/link";

const { Option } = AntdSelect;

const BaseBooks = () => {
  const router = useRouter();
  const searchPagination = useSearchParams();

  const [pageNum, setPageNum] = useState<number>(
    Number(searchPagination.get("page")) || 1,
  );

  const handlePageChange = (newPage: number) => {
    setPageNum(newPage);

    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());

    router.push(`?${params.toString()}`);
  };

  const resetPageToOne = () => {
    setPageNum(1);
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const t = useTranslations();
  // const [pageNum, setPageNum] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [debouncedSearchAuthor, setDebouncedSearchAuthor] =
    useState(searchQuery);
  const [debouncedSearchTitle, setDebouncedSearchTitle] = useState(searchTitle);
  const [open, setOpen] = useState<boolean>(false);
  const [form] = Form.useForm();

  const { user } = useLayoutStore();
  const role = user?.role?.toString().toLowerCase().replace("_", "-");

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [filterColumn, setFilterColumn] = useState<string>("fullInfo");
  const [filterOperator, setFilterOperator] = useState<string>("contains");
  const [filterValue, setFilterValue] = useState<string>("");

  const [fullInfoTitle, setFullInfoTitle] = useState<string>("");
  const [fullInfoAuthor, setFullInfoAuthor] = useState<string>("");

  const getSearchParams = () => {
    if (filterColumn === "fullInfo") {
      let query = "";

      if (fullInfoTitle.trim()) {
        query = `~${fullInfoTitle.trim()}`;
      }
      if (fullInfoAuthor.trim()) {
        query = `${fullInfoAuthor.trim()}`;
      }
      if (fullInfoAuthor.trim() && fullInfoAuthor.trim()) {
        query = `${fullInfoAuthor.trim()}~${fullInfoTitle.trim()}`;
      }

      return { field: "fullInfo", query };
    }
    return { field: filterColumn, query: filterValue };
  };

  const searchParams = getSearchParams();

  const { data: baseBooks, isLoading } = useBaseBook({
    pageNum,
    sortDirection,
    field: searchParams.field,
    query: searchParams.query,
  });

  const createBaseBook = useCreateBaseBook();
  const { data: categories } = useBaseBooksCategory();
  const deleteBook = useDeleteBaseBook();
  const updateBook = useUpdateBaseBook();
  const [editingBook, setEditingBook] = useState<string | null>(null);
  const uploadExcel = useUploadExcelBook();
  const allExcelImport = useAllExcelImport();
  const importExcel = useImportExcelBook();

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
      setDebouncedSearchAuthor(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery !== "") {
      resetPageToOne();
    }
  }, [debouncedSearchAuthor]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTitle(searchTitle);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTitle]);

  useEffect(() => {
    if (searchTitle !== "") {
      resetPageToOne();
    }
  }, [debouncedSearchTitle]);

  useEffect(() => {
    if (fullInfoTitle !== "" || fullInfoAuthor !== "") {
      resetPageToOne();
    }
  }, [fullInfoTitle, fullInfoAuthor]);

  useEffect(() => {
    if (filterValue !== "") {
      resetPageToOne();
    }
  }, [filterValue]);

  const columns = useMemo<IColumn[]>(
    () => [
      {
        key: "index",
        dataIndex: "index",
        title: "#",
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        key: "author",
        dataIndex: "author",
        title: t("Author"),
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
        key: "title",
        dataIndex: "title",
        title: t("Title"),
        render: (text: string) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="block max-w-[180px] truncate cursor-pointer">
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
        key: "isbn",
        dataIndex: "isbn",
        title: t("Isbn"),
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
            <Link href={`/${role}/copies-books?bookId=${record.id}`}>
              <TooltipBtn
                variant={"outline"}
                title={t("See copy book")}
                size={"sm"}
              >
                <Copy />
              </TooltipBtn>
            </Link>
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
            {role === "super-admin" && (
              <DeleteActionDialog
                onConfirm={() =>
                  deleteBook.mutate(record.id, {
                    onSuccess: (res: any) => {
                      setOpen(false);
                      toast.success(res?.message || t("Delete successfully"));
                    },
                    onError: (err: any) => {
                      toast.error(
                        err?.response?.data?.message || t("Error occurred"),
                      );
                    },
                  })
                }
                title={t("Delete")}
              />
            )}
          </div>
        ),
      },
    ],
    [deleteBook, role, t],
  );

  useEffect(() => {
    if (editingBook && baseBookDetail.data) {
      form.setFieldsValue({
        ...baseBookDetail.data,
        categoryId: baseBookDetail?.data?.category?.id,
      });
    }
  }, [editingBook, form, baseBookDetail.data]);

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (formData: any) => {
    setSubmitting(true);
    const payload = {
      categoryId: Number(formData.categoryId),
      author: formData.author,
      title: formData.title,
      series: formData.series,
      titleDetails: formData.titleDetails || "",
      publicationYear: Number(formData.publicationYear),
      publisher: formData.publisher,
      publicationCity: formData.publicationCity || "",
      isbn: formData.isbn,
      pageCount: Number(formData.pageCount),
      language: formData.language,
      udc: formData.udc,
    };

    if (editingBook) {
      updateBook.mutate(
        { id: editingBook, ...payload },
        {
          onSuccess: (res: any) => {
            setOpen(false);
            toast.success(res?.message || t("Book updated successfully"));
            setSubmitting(false);
          },
          onError: (err: any) => {
            toast.error(err?.response?.data?.message || t("Error occurred"));
            setSubmitting(false);
          },
        },
      );
    } else {
      createBaseBook.mutate(payload, {
        onSuccess: (res: any) => {
          setOpen(false);
          toast.success(res?.message || t("Book created successfully"));
          setSubmitting(false);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || t("Error occurred"));
          setSubmitting(false);
        },
      });
    }
  };

  const placeholderText = useMemo(() => {
    switch (filterColumn) {
      case "isbn":
        return t("Search by ISBN");
      case "udc":
        return t("Search by UDC");
      case "series":
        return t("Search by Series");
      default:
        return t("Search by Author/Title");
    }
  }, [filterColumn, t]);

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
            <div className="flex flex-col items-center gap-4">
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
                          setFilterColumn("fullInfo");
                          setFilterValue("");
                          setFullInfoTitle("");
                          setFullInfoAuthor("");
                        }}
                        className={
                          filterColumn === "fullInfo" ? "bg-blue-50" : ""
                        }
                      >
                        {t("Author/Title search")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setFilterColumn("isbn");
                          setFilterValue("");
                          setFullInfoTitle("");
                          setFullInfoAuthor("");
                        }}
                        className={filterColumn === "isbn" ? "bg-blue-50" : ""}
                      >
                        {t("Isbn search")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setFilterColumn("udc");
                          setFilterValue("");
                          setFullInfoTitle("");
                          setFullInfoAuthor("");
                        }}
                        className={filterColumn === "udc" ? "bg-blue-50" : ""}
                      >
                        {t("UDC search")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setFilterColumn("series");
                          setFilterValue("");
                          setFullInfoTitle("");
                          setFullInfoAuthor("");
                        }}
                        className={
                          filterColumn === "series" ? "bg-blue-50" : ""
                        }
                      >
                        {t("Series search")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Input Fields */}
                  <div className="flex-1 flex items-center gap-3 px-2">
                    {filterColumn === "fullInfo" ? (
                      <>
                        <input
                          type="text"
                          placeholder={t("Author")}
                          value={fullInfoAuthor}
                          onChange={(e) => setFullInfoAuthor(e.target.value)}
                          className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
                        />
                        <div className="w-px h-5 bg-gray-300"></div>
                        <input
                          type="text"
                          placeholder={t("Title")}
                          value={fullInfoTitle}
                          onChange={(e) => setFullInfoTitle(e.target.value)}
                          className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
                        />
                      </>
                    ) : (
                      <input
                        type="text"
                        placeholder={placeholderText}
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm w-90 dark:text-white"
                      />
                    )}
                  </div>

                  {/*Search Button */}
                  <TooltipBtn
                    className="flex-shrink-0 mr-1 p-2.5 rounded-full transition-colors"
                    title={t("Search")}
                  >
                    <Search size={18} />
                  </TooltipBtn>
                </div>

                {/* Sort Buttons */}
                <div className="flex gap-2 items-center">
                  {sortDirection === "asc" ? (
                    <TooltipBtn
                      size="sm"
                      onClick={() => setSortDirection("desc")}
                    >
                      <ArrowUpWideNarrow />
                    </TooltipBtn>
                  ) : (
                    <TooltipBtn
                      size="sm"
                      onClick={() => setSortDirection("asc")}
                    >
                      <ArrowDownWideNarrow />
                    </TooltipBtn>
                  )}
                  {/* Excel menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <TooltipBtn title={t("Select type excel download")}>
                        <RiFileExcel2Line />
                      </TooltipBtn>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {role === "super-admin" && (
                        <DropdownMenuItem
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept =
                              ".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                            input.onchange = (e: any) => {
                              const file = e.target.files[0];
                              if (file) {
                                uploadExcel.mutate(file, {
                                  onSuccess: (res: any) => {
                                    toast.success(
                                      res?.message ||
                                        t("Excel muvaffaqiyatli yuklandi"),
                                    );
                                  },
                                  onError: (err: any) => {
                                    toast.error(
                                      err?.response?.data?.message ||
                                        t("Excel yuklashda xatolik"),
                                    );
                                  },
                                });
                              }
                            };
                            input.click();
                          }}
                        >
                          {t("Excel orqali kitob qo'shish")}
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem
                        onClick={() =>
                          importExcel.mutate(
                            {},
                            {
                              onSuccess: () =>
                                toast.success(
                                  t("Excel muvaffaqiyatli yuklab olindi"),
                                ),
                              onError: () =>
                                toast.error(t("Excel yuklashda xatolik")),
                            },
                          )
                        }
                      >
                        {t("Kitob qo'shish uchun excel shablon")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          allExcelImport.mutate(
                            {},
                            {
                              onSuccess: () =>
                                toast.success(
                                  t(
                                    "Barcha kitoblar muvaffaqiyatli yuklab olindi",
                                  ),
                                ),
                              onError: () =>
                                toast.error(t("Excel yuklashda xatolik")),
                            },
                          )
                        }
                      >
                        {t("Barcha kitoblarni excelga yuklash")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Add Book */}
                  <TooltipBtn
                    size="sm"
                    title={t("Add Book")}
                    variant={""}
                    onClick={() => {
                      setEditingBook(null);
                      form.resetFields();
                      setOpen(true);
                    }}
                  >
                    <Plus /> {t("Add Book")}
                  </TooltipBtn>
                </div>
              </div>
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
                  onPageChange={(e) => handlePageChange(e.selected + 1)}
                  pageRangeDisplayed={3}
                  marginPagesDisplayed={1}
                  pageCount={Math.ceil(
                    (baseBooks?.data?.totalElements || 0) / 10,
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
                  pageClassName="list-none"
                  pageLinkClassName="px-3 py-1 rounded-full border cursor-pointer block"
                  activeLinkClassName="bg-green-600 text-white rounded-full"
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
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
        centered
      >
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <div className="grid md:grid-cols-2 gap-3">
            <Form.Item
              label={t("Title")}
              name="title"
              rules={[{ required: true }]}
            >
              <Input placeholder={t("Title")} required />
            </Form.Item>
            <Form.Item label={t("Author")} name="author">
              <Input placeholder={t("Author")} />
            </Form.Item>
            <Form.Item label={t("Series")} name="series">
              <Input placeholder={t("Series")} />
            </Form.Item>
            <Form.Item
              label={t("Category")}
              name="categoryId"
              rules={[{ required: true }]}
            >
              <AntdSelect
                aria-required={true}
                showSearch
                style={{ width: "100%" }}
                placeholder={t("Select category")}
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={categories?.data?.map((cat: Record<string, any>) => ({
                  value: cat.id,
                  label: `${cat.name}`,
                }))}
              />
            </Form.Item>
          </div>

          <Divider />
          <h1 className="text-base font-semibold mb-2">
            {t("Publication Details")}
          </h1>
          <div className="grid md:grid-cols-3 gap-3">
            <Form.Item label={t("Publication year")} name="publicationYear">
              <InputNumber
                style={{ width: "100%" }}
                placeholder={t("Publication year enter")}
              />
            </Form.Item>
            <Form.Item label={t("Publisher")} name="publisher">
              <Input placeholder={t("Publication enter name")} />
            </Form.Item>
            <Form.Item label={t("Publication City")} name="publicationCity">
              <Input placeholder={t("Publication city")} />
            </Form.Item>
          </div>

          <Divider />
          <h1 className="text-base font-semibold mb-2">
            {t("Additional Information")}
          </h1>
          <div className="grid md:grid-cols-2 gap-3">
            <Form.Item label={t("Isbn")} name="isbn">
              <Input placeholder={t("Isbn")} />
            </Form.Item>
            <Form.Item
              label={t("Page Count")}
              name="pageCount"
              rules={[{ required: true }]}
            >
              <InputNumber
                required={true}
                style={{ width: "100%" }}
                min={1}
                placeholder={t("Page Count")}
              />
            </Form.Item>
            <Form.Item label={t("Language")} name="language">
              <Input placeholder={t("Language enter")} />
            </Form.Item>
            <Form.Item label={t("UDC")} name="udc">
              <Input placeholder={t("UDC Number")} />
            </Form.Item>
            <Form.Item label={t("Title details")} name="titleDetails">
              <TextArea rows={4} placeholder={t("Title details")} />
            </Form.Item>
          </div>

          <div className="flex justify-end mt-4 gap-2">
            <AntButton onClick={() => setOpen(false)}>{t("Cancel")}</AntButton>
            <Button className="text-white" loading={submitting}>
              {editingBook ? t("Edit book") : t("Add book")}
            </Button>
          </div>
        </Form>
      </Modal>
      {/* Detail Sheet */}
      <Sheet
        open={detailOpen}
        onOpenChange={(v) => {
          if (!v) {
            setDetailOpen(false);
            setTimeout(() => setSelectedId(null), 500); // 300ms — yopilish animatsiyasidan so'ng
          } else {
            setDetailOpen(true);
          }
        }}
      >
        <SheetContent className="hide-scroll" side={"center"}>
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
                  detail?.data?.book?.title || (
                    <span className={"text-red-600"}>{t("Unknown")}</span>
                  )
                )}
              </p>
              <p className="flex justify-between items-start gap-2">
                <strong className="whitespace-nowrap">{t("Author")}:</strong>
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[70%] truncate cursor-pointer">
                          {detail?.data?.book?.author || (
                            <span className={"text-red-600"}>
                              {t("Unknown")}
                            </span>
                          )}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm whitespace-pre-wrap">
                        {detail?.data?.book?.author || (
                          <span className={"text-red-600"}>{t("Unknown")}</span>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </p>

              <p className="flex justify-between items-center">
                <strong>{t("Category")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.category?.name || (
                    <span className={"text-red-600"}>{t("Unknown")}</span>
                  )
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Language")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.language || (
                    <span className={"text-red-600"}>{t("Unknown")}</span>
                  )
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Publisher")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.publisher || (
                    <span className={"text-red-600"}>{t("Unknown")}</span>
                  )
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Publication city")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.publicationCity || (
                    <span className={"text-red-600"}>{t("Unknown")}</span>
                  )
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Publication Year")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.publicationYear || (
                    <span className={"text-red-600"}>{t("Unknown")}</span>
                  )
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Total count")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.totalCount || (
                    <span className={"text-red-600"}>{t("Unknown")}</span>
                  )
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Isbn")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.isbn || (
                    <span className={"text-red-600"}>{t("Unknown")}</span>
                  )
                )}
              </p>
              <p className="flex justify-between items-start gap-2">
                <strong className="whitespace-nowrap">{t("Udc")}:</strong>
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[70%] truncate cursor-pointer">
                          {detail?.data?.book?.udc || (
                            <span className={"text-red-600"}>
                              {t("Unknown")}
                            </span>
                          )}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm whitespace-pre-wrap">
                        {detail?.data?.book?.udc || (
                          <span className={"text-red-600"}>{t("Unknown")}</span>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Series")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.series || (
                    <span className={"text-red-600"}>{t("Unknown")}</span>
                  )
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Page Count")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.pageCount || (
                    <span className={"text-red-600"}>{t("Unknown")}</span>
                  )
                )}
              </p>
              <p className="flex justify-between items-center">
                <strong>{t("Title details")}:</strong>{" "}
                {detailLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  detail?.data?.book?.titleDetails || (
                    <span className={"text-red-600"}>{t("Unknown")}</span>
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
