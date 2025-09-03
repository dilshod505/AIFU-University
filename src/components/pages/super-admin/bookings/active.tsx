"use client";

import { AutoForm } from "@/components/form/auto-form";
import { api } from "@/components/models/axios";
import MyTable, { IColumn } from "@/components/my-table";
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
import { Tag } from "antd";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
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
    },
  });

  const returnReservation = useMutation({
    mutationFn: async ({ field, query }: { field: string; query: string }) => {
      const res = await api.post("/admin/booking/return", { field, query });
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
            <Dialog>
              <DialogTrigger>
                <TooltipBtn
                  title={t("ijara vaqtini uzaytirish")}
                  variant={"ampersand"}
                  size={"sm"}
                >
                  <TimerReset />
                </TooltipBtn>
              </DialogTrigger>
              <DialogContent className={"bg-white dark:bg-background"}>
                <DialogHeader>
                  <DialogTitle>{t("ijara vaqtini uzaytirish")}</DialogTitle>
                  <DialogDescription className={"hidden"} />
                </DialogHeader>
                <div className="flex flex-col gap-2">
                  <AutoForm
                    className={"bg-white dark:bg-background"}
                    submitText={t("uzaytirish")}
                    fields={[
                      {
                        label: t("yana necha kunga ijarani uzaytirmoqchisiz"),
                        name: "extendDays",
                        type: "number",
                        min: 1,
                      },
                    ]}
                    form={form}
                    onSubmit={(values: Record<string, any>) => {
                      if (values.extendDays < 1) {
                        toast.error(t("kamida 1 kunga uzaytirish mumkin"));
                        return;
                      }
                      extendReservation.mutate({
                        extendDays: +values.extendDays,
                        bookingId: +r.id,
                      });
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>

            {/* Yakunlash */}
            <Dialog>
              <DialogTrigger>
                <TooltipBtn title={t("ijarani yakunlash")} size={"sm"}>
                  <Undo2 />
                </TooltipBtn>
              </DialogTrigger>
              <DialogContent className={"bg-white dark:bg-background"}>
                <DialogHeader>
                  <DialogTitle>{t("ijarani yakunlash")}</DialogTitle>
                  <DialogDescription className={"hidden"} />
                </DialogHeader>
                <div className="flex flex-col gap-2">
                  <AutoForm
                    className={"bg-white dark:bg-background"}
                    submitText={t("ijarani yakunlash")}
                    fields={[
                      {
                        label: t("field (masalan: inventoryNumber)"),
                        name: "field",
                        type: "text",
                      },
                      {
                        label: t("query (kitobning ID yoki inventory raqami)"),
                        name: "query",
                        type: "text",
                      },
                    ]}
                    form={form}
                    onSubmit={(values: Record<string, any>) => {
                      returnReservation.mutate({
                        field: values.field,
                        query: values.query,
                      });
                      form.reset();
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ),
      },
    ],
    [extendReservation, form, returnReservation, t, pageNumber, pageSize]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("active reservations")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("Hozirda olingan va muddati o'tgan kitoblar")} (
            {bookings?.data?.totalElements || 0})
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          {t("Yangilash")}
        </Button>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">{t("royxat")}</TabsTrigger>
          <TabsTrigger value="new-booking">
            <Plus className="h-4 w-4 mr-2" />
            {t("bron qilish")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <MyTable
            columns={columns}
            dataSource={bookings?.data?.data || []}
            isLoading={isLoading}
            pagination={false}
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
          <BorrowBookForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
