"use client";
import { IoNotificationsOutline } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AutoForm } from "@/components/form/auto-form";
import { api } from "@/components/models/axios";
import {
  useGetNotificationById,
  useGetNotifications,
} from "@/components/models/queries/notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

const NotificationHeader = () => {
  const t = useTranslations();
  const form = useForm();
  const queryClient = useQueryClient();
  const { data: notifications } = useGetNotifications();
  const [extendingNotification, setExtendingNotification] = useState<
    number | null
  >(null);
  const [selected, setSelected] = useState<{ id: number; type: string } | null>(
    null,
  );
  const { data: detail } = useGetNotificationById(selected?.id || undefined);
  const [open, setOpen] = useState(false);

  const accept = useMutation({
    mutationFn: async ({
      extendDays,
      notificationId,
    }: {
      notificationId: number;
      extendDays: number;
    }) => {
      const res = await api.post("/admin/actions/extend/accept", {
        extendDays: +extendDays,
        notificationId,
      });
      return res.data;
    },
  });

  const reject = useMutation({
    mutationFn: async ({ notificationId }: { notificationId: number }) => {
      const res = await api.post("/admin/actions/extend/reject", {
        notificationId,
      });
      return res.data;
    },
  });

  const totalNotifications = notifications?.data?.data?.length || 0;

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <IoNotificationsOutline size={20} />
            {totalNotifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                {totalNotifications}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:w-[540px] p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>{t("Notifications")}</SheetTitle>
          </SheetHeader>

          <div className="h-[calc(100vh-80px)] flex flex-col">
            <Tabs
              defaultValue="EXTEND"
              className="w-full"
              onValueChange={() => setSelected(null)}
            >
              <TabsList className="mb-5 w-full">
                <TabsTrigger
                  value="EXTEND"
                  className="flex-1 data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
                >
                  {t("uzaytirish")}
                </TabsTrigger>
                <TabsTrigger
                  value="WARNING"
                  className="flex-1 data-[state=active]:bg-red-100 data-[state=active]:text-red-700"
                >
                  {t("warning")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="EXTEND">
                <div className="flex flex-col gap-3">
                  {(notifications?.data?.data || [])
                    .filter((n: any) => n.notificationType === "EXTEND")
                    .map((n: any) => (
                      <Card
                        key={n.id}
                        className={`cursor-pointer transition hover:shadow-md ${
                          selected?.id === n.id
                            ? "border-green-700 border-2"
                            : ""
                        }`}
                        onClick={() =>
                          setSelected({ id: n.id, type: "EXTEND" })
                        }
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">
                                {n.name} {n.surname}
                              </p>
                              <p className="text-xs text-gray-500">{n.date}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-700">
                              {t("uzaytirish")}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              {/* WARNING list */}
              <TabsContent value="WARNING">
                <div className="flex flex-col gap-3">
                  {(notifications?.data?.data || [])
                    .filter((n: any) => n.notificationType === "WARNING")
                    .map((n: any) => (
                      <Card
                        key={n.id}
                        className={`cursor-pointer transition hover:shadow-md ${
                          selected?.id === n.id ? "border-red-700" : ""
                        }`}
                        onClick={() =>
                          setSelected({ id: n.id, type: "WARNING" })
                        }
                      >
                        <CardContent className="px-3">
                          <div className="flex justify-end items-center">
                            <Badge className="text-sm bg-red-100 text-red-700">
                              {t("warning")}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <p className="font-medium">{n.bookTitle}</p>
                            <p className="text-xs text-gray-500">{n.date}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Detail view at bottom */}
            {selected && detail && (
              <div className="border-t p-4 bg-muted/30">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm">
                      {t("Notification detail")}
                    </h3>
                    {selected?.type === "EXTEND" && (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                        {t("uzaytirish")}
                      </Badge>
                    )}
                    {selected?.type === "WARNING" && (
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-xs">
                        {t("warning")}
                      </Badge>
                    )}
                  </div>

                  {selected.type === "EXTEND" && detail?.data?.student && (
                    <div className="space-y-1 text-xs">
                      <p>
                        <span className="font-semibold">{t("Name")}:</span>{" "}
                        {detail.data.student.name}
                      </p>
                      <p>
                        <span className="font-semibold">{t("Surname")}:</span>{" "}
                        {detail.data.student.surname}
                      </p>
                      <p>
                        <span className="font-semibold">{t("Faculty")}:</span>{" "}
                        {detail.data.student.faculty}
                      </p>
                    </div>
                  )}

                  {detail?.data?.book && (
                    <div className="space-y-1 text-xs">
                      <p>
                        <span className="font-semibold">{t("Title")}:</span>{" "}
                        {detail.data.book.title}
                      </p>
                      <p>
                        <span className="font-semibold">{t("Author")}:</span>{" "}
                        {detail.data.book.author}
                      </p>

                      {selected.type === "EXTEND" && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            onClick={() => {
                              setExtendingNotification(selected.id);
                            }}
                            size="sm"
                            className="text-xs h-8"
                          >
                            {t("accept")}
                          </Button>
                          <Button
                            onClick={() => {
                              if (selected.id) {
                                reject.mutate({
                                  notificationId: selected.id,
                                });
                              }
                            }}
                            size="sm"
                            variant="destructive"
                            className="text-xs h-8"
                          >
                            {t("reject")}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* EXTEND modal */}
      <Sheet
        open={!!extendingNotification}
        onOpenChange={() => setExtendingNotification(null)}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle asChild>
              <h1>{t("ijara vaqtini uzaytirish")}</h1>
            </SheetTitle>
            <AutoForm
              submitText={t("ijara vaqtini uzaytirish")}
              className="p-0 my-5 border-0 bg-transparent"
              onSubmit={async (values: Record<string, any>) => {
                if (extendingNotification) {
                  accept.mutate({
                    extendDays: values.extendDays,
                    notificationId: extendingNotification,
                  });
                }
                form.reset();
                await queryClient.invalidateQueries({
                  queryKey: ["notifications"],
                });
                setExtendingNotification(null);
              }}
              fields={[
                {
                  label: t("yana necha kunga ijarani uzaytirmoqchisiz"),
                  name: "extendDays",
                },
              ]}
              form={form}
            />
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default NotificationHeader;
