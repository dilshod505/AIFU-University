"use client";

import { api } from "@/components/models/axios";
import MyTable, { type IColumn } from "@/components/my-table";
import { BorrowBookForm } from "@/components/pages/super-admin/bookings/borrow-book-form";
import TooltipBtn from "@/components/tooltip-btn";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, InputNumber, Tag } from "antd";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileDown,
  Plus,
  Search,
  Settings2,
  TimerReset,
  Undo2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import ReactPaginate from "react-paginate";
import { toast } from "sonner";
import {
  useBookingByStudentId,
  useByIdBookingDetail,
} from "@/components/models/queries/booking";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { GiCancel } from "react-icons/gi";
import { useLocationParams } from "@/hooks/use-location-params";
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

// 🔹 API orqali bookinglarni olish
// 🔹 API orqali bookinglarni olish
async function fetchBookings({
  pageNum,
  pageSize,
  filter,
  field,
  query,
  sortDirection,
}: {
  pageNum: number;
  pageSize: number;
  filter: "all" | "APPROVED" | "OVERDUE";
  field?:
    | "studentId"
    | "cardNumber"
    | "fullName"
    | "bookEpc"
    | "inventoryNumber";
  query?: string | number;
  sortDirection?: "asc" | "desc";
}) {
  const res = await api.get("/admin/booking", {
    params: {
      pageNum,
      pageSize,
      filter,
      field,
      query,
      sortDirection,
    },
  });
  return res.data;
}

export default function ActiveBookingsPage() {
  const router = useRouter();
  const searchPagination = useSearchParams();

  const [firstQuery, setFirstQuery] = useState("");
  const [secondQuery, setSecondQuery] = useState("");

  // 🔹 Debounce uchun kechikkan qiymatlar
  const [searchValue, setSearchValue] = useState<string>("");
  const [debouncedFirstQuery, setDebouncedFirstQuery] = useState(firstQuery);
  const [debouncedSecondQuery, setDebouncedSecondQuery] = useState(secondQuery);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);

  const { query, push } = useLocationParams();

  const [activeTab, setActiveTab] = useState<"list" | "new-booking">(
    (query?.tab as "list" | "new-booking") ?? "list",
  );

  const [pageNumber, setPageNum] = useState<number>(
    Number(searchPagination.get("page")) || 1,
  );

  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null,
  );
  const [open, setOpen] = useState(false);
  const detail = useByIdBookingDetail(selectedBookingId);

  const handlePageChange = (newPage: number) => {
    setPageNum(newPage);

    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());

    router.push(`?${params.toString()}`);
  };

  const t = useTranslations();
  const form = useForm();
  const queryClient = useQueryClient();
  const [extendForm] = Form.useForm();
  const [isExtendOpen, setIsExtendOpen] = useState<string | null>(null);
  // const [activeTab, setActiveTab] = useState<"list" | "new-booking">("list"); // 🔹 tab state

  const [searchField, setSearchField] = useState<
    "studentId" | "cardNumber" | "fullName" | "bookEpc" | "inventoryNumber"
  >("fullName");

  // 🔹 Filter
  const [filter, setFilter] = useState<"all" | "APPROVED" | "OVERDUE">("all");
  // const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const { data: bookings, isLoading } = useQuery({
    queryKey: [
      "bookings",
      pageNumber,
      pageSize,
      filter,
      searchField,
      searchValue,
    ],
    queryFn: () =>
      fetchBookings({
        pageNum: pageNumber,
        pageSize,
        filter,
        field: searchValue ? searchField : undefined,
        query: searchValue || undefined,
        sortDirection: "desc",
      }),
  });

  const extendReservation = useMutation({
    mutationFn: async ({
      bookingId,
      extendDays,
    }: {
      bookingId: number;
      extendDays: number;
    }) => {
      const res = await api.post("/admin/booking/extend", {
        bookingId,
        extendDays,
      });
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success(t("ijara muddati muvaffaqiyatli uzaytirildi"));
      setIsExtendOpen(null);
    },
  });

  const returnReservation = useMutation({
    mutationFn: async ({ bookingId }: { bookingId: number | string }) => {
      const res = await api.post("/admin/booking/return", { bookingId });
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success(t("ijara muvaffaqiyatli yakunlandi"));
    },
  });

  const exportExcel = useMutation({
    mutationFn: async () => {
      const res = await api.get("/admin/backup/booking", {
        responseType: "blob", // Excel blob fayl sifatida keladi
      });

      // Faylni browserda yuklab olish
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "booking.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  });

  const columns = useMemo<IColumn[]>(
    () => [
      {
        title: "#",
        dataIndex: "index",
        key: "index",
        render: (_t: any, __: any, index: number) =>
          (pageNumber - 1) * pageSize + (index + 1),
      },
      {
        title: t("firstName"),
        dataIndex: "name",
        key: "name",
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
        title: t("lastName"),
        dataIndex: "surname",
        key: "surname",
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
        title: t("book name"),
        dataIndex: "title",
        key: "title",
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
        title: t("book author"),
        dataIndex: "author",
        key: "author",
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
        title: t("ijaraga berilgan sana"),
        dataIndex: "givenAt",
        key: "givenAt",
      },
      { title: t("ijara tugash sanasi"), dataIndex: "dueDate", key: "dueDate" },
      {
        title: t("ijara holati"),
        dataIndex: "status",
        key: "status",
        render: (status: string) => (
          <Tag color={status === "APPROVED" ? "green" : "red"}>{t(status)}</Tag>
        ),
      },
      {
        title: t("actions"),
        dataIndex: "actions",
        key: "actions",
        fixed: "right",
        render: (_: any, r: any) => (
          <div className="flex gap-2">
            {/* Uzaytirish */}
            <TooltipBtn
              title={"Detail"}
              variant={"ampersand"}
              onClick={() => {
                setSelectedBookingId(r.id);
                setOpen(true);
              }}
            >
              <Eye />
            </TooltipBtn>
            <TooltipBtn
              onClick={() => setIsExtendOpen(r?.id)}
              title={t("ijara vaqtini uzaytirish")}
              variant={"view"}
              size={"sm"}
            >
              <TimerReset />
            </TooltipBtn>
            <Dialog>
              <DialogTrigger asChild>
                <TooltipBtn title={t("ijarani yakunlash")} size={"sm"}>
                  <Undo2 />
                </TooltipBtn>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-background">
                <DialogHeader>
                  <DialogTitle>{t("ijarani yakunlash")}</DialogTitle>
                  <DialogDescription>
                    {t("Haqiqatan ham bu ijarani yakunlamoqchimisiz")}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex justify-end gap-2 mt-4">
                  {/* Yo‘q tugmasi */}
                  <Button variant="outline">{t("yoq")}</Button>

                  {/* Ha tugmasi */}
                  <Button
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={() => {
                      returnReservation.mutate({ bookingId: r.id }); // <--- id bo'lishi kerak
                    }}
                  >
                    {t("Ha")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ),
      },
    ],
    [
      extendReservation,
      form,
      returnReservation,
      t,
      pageNumber,
      pageSize,
      extendForm,
    ],
  );

  // 🕐 fullName (ikki input) uchun debounce
  // 🕐 fullName (ikki input) uchun debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFirstQuery(firstQuery);
      setDebouncedSecondQuery(secondQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [firstQuery, secondQuery]);

  // 🕐 boshqa search fieldlar uchun debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchValue]);

  // 🔹 Qidiruv va paginationni sinxronlashtirish
  useEffect(() => {
    // Agar fullName tanlangan bo‘lsa, ikkala inputni birlashtiramiz
    if (searchField === "fullName") {
      const joined = [debouncedFirstQuery, debouncedSecondQuery]
        .filter(Boolean)
        .join("~");
      setSearchValue(joined);
    }

    // Har safar qidiruv fieldi yoki qiymati o‘zgarsa — 1-sahifaga qaytish
    setPageNum(1);

    // Har safar qidiruv o‘zgarsa — qayta yuklaymiz
    queryClient.invalidateQueries({ queryKey: ["bookings"] });

    // URLni ham yangilab qo‘yamiz (optional)
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1");

    if (searchValue) {
      params.set("query", searchValue);
      params.set("field", searchField);
    } else {
      params.delete("query");
      params.delete("field");
    }

    router.push(`?${params.toString()}`);
  }, [
    debouncedFirstQuery,
    debouncedSecondQuery,
    debouncedSearchValue,
    searchField,
  ]);

  return (
    <div className="p-2">
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as "list" | "new-booking");
          push({ tab: val }, { update: true });
        }}
      >
        <TabsContent value="list" className="space-y-4">
          <MyTable
            title={
              <h1 className="text-2xl font-semibold">
                {t("active reservations")}
              </h1>
            }
            columns={columns}
            dataSource={bookings?.data?.data || []}
            isLoading={isLoading}
            pagination={false}
            header={
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-full shadow-lg p-1 flex items-center gap-2 bg-white dark:bg-gray-900">
                    {/* Filter Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <TooltipBtn
                          className="flex-shrink-0 mr-1 p-2.5 rounded-full transition-colors"
                          title={t("Filter")}
                        >
                          <Settings2 size={18} />
                        </TooltipBtn>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuItem
                          onClick={() => {
                            setSearchField("cardNumber");
                            setSearchValue("");
                            setFirstQuery("");
                            setSecondQuery("");
                          }}
                          className={
                            searchField === "cardNumber" ? "bg-blue-50" : ""
                          }
                        >
                          {t("Card number")}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            setSearchField("fullName");
                            setSearchValue("");
                            setFirstQuery("");
                            setSecondQuery("");
                          }}
                          className={
                            searchField === "fullName" ? "bg-blue-50" : ""
                          }
                        >
                          {t("Name and last name search")}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            setSearchField("bookEpc");
                            setSearchValue("");
                            setFirstQuery("");
                            setSecondQuery("");
                          }}
                          className={
                            searchField === "bookEpc" ? "bg-blue-50" : ""
                          }
                        >
                          {t("Book EPC")}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            setSearchField("inventoryNumber");
                            setSearchValue("");
                            setFirstQuery("");
                            setSecondQuery("");
                          }}
                          className={
                            searchField === "inventoryNumber"
                              ? "bg-blue-50"
                              : ""
                          }
                        >
                          {t("Inventory number")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Search Inputs */}
                    <div className="flex-1 flex items-center gap-3 px-2">
                      {searchField === "fullName" ? (
                        <>
                          <input
                            type="text"
                            placeholder={t("Name")}
                            value={firstQuery}
                            onChange={(e) => setFirstQuery(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm dark:text-white"
                          />
                          <div className="w-px h-5 bg-gray-300 dark:bg-gray-700"></div>
                          <input
                            type="text"
                            placeholder={t("Last Name")}
                            value={secondQuery}
                            onChange={(e) => setSecondQuery(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm dark:text-white"
                          />
                        </>
                      ) : (
                        <input
                          type="text"
                          placeholder={t("Search")}
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          className="w-90 flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm dark:text-white"
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

                  {/* Excel Export */}
                  <TooltipBtn
                    title={t("Excelga yuklab olish")}
                    onClick={() => exportExcel.mutate()}
                    disabled={exportExcel.isPending}
                  >
                    <FileDown className="w-4 h-4" />
                    {exportExcel.isPending ? t("Yuklanmoqda...") : ""}
                  </TooltipBtn>

                  {/* Add Booking */}
                </div>

                {/* Tabs Filter */}
                <Tabs
                  value={filter}
                  onValueChange={(val: string) => {
                    setFilter(val as any);
                    setPageNum(1);
                  }}
                >
                  <TabsList className="flex gap-2">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                    >
                      {t("All")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="APPROVED"
                      className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                    >
                      {t("APPROVED")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="OVERDUE"
                      className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                    >
                      {t("OVERDUE")}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <TooltipBtn
                  size="sm"
                  title={t("bron qilish")}
                  onClick={() => setActiveTab("new-booking")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("bron qilish")}
                </TooltipBtn>
              </div>
            }
            footer={
              <div
                className={
                  "flex flex-col lg:flex-row justify-between items-center gap-2"
                }
              >
                <div className="font-bold text-[20px] space-y-1 flex items-center gap-5">
                  <p className="text-sm">
                    {t("Total Pages")}:{" "}
                    <span className="text-green-600">
                      {bookings?.data?.totalPages}
                    </span>
                  </p>
                  <p className="text-sm">
                    {t("Current Page")}:{" "}
                    <span className="text-green-600">
                      {bookings?.data?.currentPage}
                    </span>
                  </p>
                  <p className="text-sm">
                    {t("Total Elements")}:{" "}
                    <span className="text-green-600">
                      {bookings?.data?.totalElements}
                    </span>
                  </p>
                </div>

                <ReactPaginate
                  breakLabel="..."
                  onPageChange={(e) => handlePageChange(e.selected + 1)}
                  forcePage={pageNumber - 1}
                  pageRangeDisplayed={3}
                  marginPagesDisplayed={1}
                  pageCount={bookings?.data?.totalPages || 0}
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
                  pageClassName="list-none"
                  pageLinkClassName="px-3 py-1 rounded-full border cursor-pointer block"
                  activeLinkClassName="bg-green-600 text-white rounded-full"
                />
              </div>
            }
          />
        </TabsContent>

        <TabsContent value="new-booking">
          <div className="mb-4">
            <Button
              onClick={() =>
                (window.location.href = "/super-admin/bookings/active")
              }
            >
              <ChevronLeft className="mr-2" />
              {t("royxat")}
            </Button>
          </div>
          <BorrowBookForm />
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!isExtendOpen}
        onOpenChange={(t: boolean) => {
          if (!t) {
            extendForm.resetFields();
            setIsExtendOpen(null);
          }
        }}
      >
        <DialogContent className="bg-white dark:bg-background">
          <DialogHeader>
            <DialogTitle>{t("ijara vaqtini uzaytirish")}</DialogTitle>
            <DialogDescription className={"hidden"} />
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Form
              form={extendForm}
              layout="vertical"
              onFinish={(values) => {
                if (isExtendOpen === null) return;
                const extendDays = values.extendDays;

                if (!extendDays || extendDays < 1) {
                  toast.error(t("kamida 1 kunga uzaytirish mumkin"));
                  return;
                }

                extendReservation.mutate(
                  { extendDays, bookingId: +isExtendOpen },
                  {
                    onSuccess: () => {
                      extendForm.resetFields();
                      setIsExtendOpen(null); // ✅ Modal yopiladi
                    },
                  },
                );

                extendForm.resetFields();
              }}
            >
              <Form.Item
                label={t("yana necha kunga ijarani uzaytirmoqchisiz")}
                name="extendDays"
                rules={[
                  {
                    required: true,
                    message: t("kamida 1 kunga uzaytirish mumkin"),
                  },
                  {
                    type: "number",
                    min: 1,
                    message: t("kamida 1 kunga uzaytirish mumkin"),
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  placeholder={t("kunlar soni")}
                  style={{ width: "100%" }}
                  size="large"
                />
              </Form.Item>
              <Form.Item>
                <TooltipBtn
                  className={"w-full"}
                  type="primary"
                  htmlType="submit"
                  loading={extendReservation.isPending}
                >
                  {t("uzaytirish")}
                </TooltipBtn>
              </Form.Item>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className=" overflow-y-auto" side={"center"}>
          <SheetHeader className="flex flex-row items-center justify-between">
            <SheetTitle>{t("Booking detail")}</SheetTitle>
          </SheetHeader>

          <div className="p-3">
            <div className="space-y-3">
              <p className="flex justify-between items-center">
                <strong>{t("Name")}:</strong>{" "}
                {isLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  (detail?.data?.data?.name ?? "-")
                )}
              </p>

              <p className="flex justify-between items-center">
                <strong>{t("Surname")}:</strong>{" "}
                {isLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  (detail?.data?.data?.surname ?? "-")
                )}
              </p>

              <p className="flex justify-between items-center">
                <strong>{t("Card number")}:</strong>{" "}
                {isLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  (detail?.data?.data?.cardNumber ?? "-")
                )}
              </p>

              <p className="flex justify-between items-center">
                <strong>{t("Phone number")}:</strong>{" "}
                {isLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  (detail?.data?.data?.phoneNumber ?? "-")
                )}
              </p>

              {/* Fakultet */}
              <p className="flex justify-between items-start gap-2">
                <strong className="whitespace-nowrap">{t("Faculty")}:</strong>
                {isLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[70%] truncate cursor-pointer">
                          {detail?.data?.data?.faculty ?? "-"}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm whitespace-pre-wrap">
                        {detail?.data?.data?.faculty}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </p>

              {/* Muallif */}
              <p className="flex justify-between items-start gap-2">
                <strong className="whitespace-nowrap">{t("Author")}:</strong>
                {isLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[70%] truncate cursor-pointer">
                          {detail?.data?.data?.author ?? "-"}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm whitespace-pre-wrap">
                        {detail?.data?.data?.author}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </p>

              {/* Sarlavha */}
              <p className="flex justify-between items-start gap-2">
                <strong className="whitespace-nowrap">{t("Title")}:</strong>
                {isLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[70%] truncate cursor-pointer">
                          {detail?.data?.data?.title ?? "-"}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm whitespace-pre-wrap">
                        {detail?.data?.data?.title}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </p>

              <p className="flex justify-between items-center">
                <strong>{t("Inventory number")}:</strong>{" "}
                {isLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  (detail?.data?.data?.inventoryNumber ?? "-")
                )}
              </p>

              <p className="flex justify-between items-center">
                <strong>{t("Given at")}:</strong>{" "}
                {isLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  (detail?.data?.data?.givenAt ?? "-")
                )}
              </p>

              <p className="flex justify-between items-center">
                <strong>{t("Due date")}:</strong>{" "}
                {isLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : (
                  (detail?.data?.data?.dueDate ?? "-")
                )}
              </p>

              <p className="flex justify-between items-center">
                <strong>{t("Status")}:</strong>{" "}
                {isLoading ? (
                  <Skeleton className="w-1/2 h-5" />
                ) : detail?.data?.data?.status ? (
                  <Tag
                    color={
                      detail.data.data.status === "APPROVED"
                        ? "green"
                        : detail.data.data.status === "OVERDUE"
                          ? "red"
                          : "default"
                    }
                  >
                    {t(detail.data.data.status)}
                  </Tag>
                ) : (
                  "-"
                )}
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
