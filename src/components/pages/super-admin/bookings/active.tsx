"use client";

import { Plus, RefreshCw, TimerReset, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBookings } from "@/hooks/use-bookings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BorrowBookForm } from "@/components/pages/super-admin/bookings/borrow-book-form";
import { useTranslations } from "next-intl";
import MyTable, { IColumn } from "@/components/my-table";
import { useMemo, useState } from "react";
import { Tag } from "antd";
import TooltipBtn from "@/components/tooltip-btn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/components/models/axios";
import { toast } from "sonner";
import { AutoForm } from "@/components/form/auto-form";
import { useForm } from "react-hook-form";

export default function ActiveBookingsPage() {
  const t = useTranslations();
  const [newDate, setNewDate] = useState<number>(0);
  const form = useForm();
  const queryClient = useQueryClient();
  const { data: bookings = [], isLoading, error, refetch } = useBookings();
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
    mutationFn: async ({ epc }: { epc: string }) => {
      const res = await api.post("/admin/booking/return", { epc });
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
        render: (_t: any, __: any, index: number) => index + 1,
      },
      {
        title: t("firstName"),
        dataIndex: "name",
        key: "name",
      },
      {
        title: t("lastName"),
        dataIndex: "surname",
        key: "surname",
      },
      {
        title: t("book name"),
        dataIndex: "title",
        key: "title",
      },
      {
        title: t("book author"),
        dataIndex: "author",
        key: "author",
      },
      {
        title: t("ijaraga berilgan sana"),
        dataIndex: "givenAt",
        key: "givenAt",
      },
      {
        title: t("ijara tugash sanasi"),
        dataIndex: "dueDate",
        key: "dueData",
      },
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
                        minLength: 1,
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
                        label: t("kitob ID-sini kiriting"),
                        name: "epc",
                        type: "text",
                        min: 1,
                        minLength: 1,
                      },
                    ]}
                    form={form}
                    onSubmit={(values: Record<string, any>) => {
                      if (values.epc < 1) {
                        toast.error(t("kitob ID-sini kiriting"));
                        return;
                      }
                      returnReservation.mutate({
                        epc: values.epc,
                      });
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ),
      },
    ],
    [t],
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("active reservations")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("Hozirda olingan va muddati o'tgan kitoblar")} ({bookings.length}
            )
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
            columnVisibility
            columns={columns}
            dataSource={bookings}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="new-booking">
          <BorrowBookForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
