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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, InputNumber, Tag } from "antd";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  TimerReset,
  Undo2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import ReactPaginate from "react-paginate";
import { toast } from "sonner";

// 🔹 API orqali bookinglarni olish
async function fetchBookings(pageNum: number, pageSize: number) {
  const res = await api.get(`/admin/booking?pageNum=${pageNum}&pageSize=10`);
  return res.data;
}

export default function ActiveBookingsPage() {
  const t = useTranslations();
  const form = useForm();
  const queryClient = useQueryClient();
  const [extendForm] = Form.useForm();
  const [isExtendOpen, setIsExtendOpen] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "new-booking">("list"); // 🔹 tab state

  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const {
    data: bookings,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["bookings", pageNumber, pageSize],
    queryFn: () => fetchBookings(pageNumber, pageSize),
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
    <div className="p-6 space-y-6">
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
              <TabsList>
                <TabsTrigger value="list">{t("royxat")}</TabsTrigger>
                <TabsTrigger value="new-booking">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("bron qilish")}
                </TabsTrigger>
              </TabsList>
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
                  onPageChange={(e) => {
                    const newPageNum = e.selected + 1;
                    setPageNumber(newPageNum);
                  }}
                  pageRangeDisplayed={3}
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
                  forcePage={pageNumber - 1}
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
