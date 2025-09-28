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
  FileDown,
  Plus,
  TimerReset,
  Undo2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import ReactPaginate from "react-paginate";
import { toast } from "sonner";

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
    | "invetoryNumber";
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

  const [pageNum, setPageNum] = useState<number>(
    Number(searchPagination.get("page")) || 1
  );

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
  const [activeTab, setActiveTab] = useState<"list" | "new-booking">("list"); // 🔹 tab state

  const [searchField, setSearchField] = useState<
    "studentId" | "cardNumber" | "fullName" | "bookEpc" | "invetoryNumber"
  >("fullName");
  const [searchValue, setSearchValue] = useState<string>("");

  // 🔹 Filter
  const [filter, setFilter] = useState<"all" | "APPROVED" | "OVERDUE">("all");
  const [pageNumber, setPageNumber] = useState<number>(1);
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
      { title: t("firstName"), dataIndex: "name", key: "name" },
      { title: t("lastName"), dataIndex: "surname", key: "surname" },
      { title: t("book name"), dataIndex: "title", key: "title" },
      { title: t("book author"), dataIndex: "author", key: "author" },
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
              onClick={() => setIsExtendOpen(r?.id)}
              title={t("ijara vaqtini uzaytirish")}
              variant={"ampersand"}
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
    ]
  );

  return (
    <div className="p-2">
      <Tabs
        defaultValue="list"
        className="space-y-4"
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "list" | "new-booking")}
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
              <>
                <div className="flex gap-2 items-center">
                  <Select
                    value={searchField}
                    onValueChange={(val: any) => setSearchField(val)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t("Search by")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardNumber">
                        {t("Card number")}
                      </SelectItem>
                      <SelectItem value="fullName">{t("Full name")}</SelectItem>
                      <SelectItem value="bookEpc">{t("Book EPC")}</SelectItem>
                      <SelectItem value="inventoryNumber">
                        {t("Inventory number")}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder={t("Search")}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                </div>
                <Tabs
                  value={filter}
                  onValueChange={(val: string) => {
                    setFilter(val as any);
                    setPageNumber(1); // filter o‘zgarsa 1-sahifaga qaytadi
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
                  title={t("Excelga yuklab olish")}
                  onClick={() => exportExcel.mutate()}
                  disabled={exportExcel.isPending}
                >
                  <FileDown className="w-4 h-4" />
                  {exportExcel.isPending ? t("Yuklanmoqda...") : ""}
                </TooltipBtn>

                <TabsList>
                  {activeTab !== "list" && (
                    <TabsTrigger value="list">{t("royxat")}</TabsTrigger>
                  )}
                  <TabsTrigger value="new-booking">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("bron qilish")}
                  </TabsTrigger>
                </TabsList>
              </>
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
                  forcePage={pageNum - 1}
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
          {/* 🔹 Orqaga qaytish tugmasi qo‘shib qo‘ysak ham bo‘ladi */}
          <div className="mb-4">
            <Button onClick={() => setActiveTab("list")}>
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
                  }
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
    </div>
  );
}
