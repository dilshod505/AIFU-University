"use client";
import { IoChevronBack, IoPersonCircleOutline } from "react-icons/io5";
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
import { api } from "@/components/models/axios";
import {
  useDeleteNotification,
  useGetNotificationById,
  useGetNotifications,
} from "@/components/models/queries/notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import TooltipBtn from "@/components/tooltip-btn";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell } from "lucide-react";
import { useNotificationSocket } from "@/hooks/webSocket";

const NotificationHeader = () => {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { data: notifications } = useGetNotifications();
  const deleteNotification = useDeleteNotification();
  const [showExtendForm, setShowExtendForm] = useState(false);
  const [extendDays, setExtendDays] = useState("");
  const [selected, setSelected] = useState<{ id: number; type: string } | null>(
    null,
  );
  const { data: detail } = useGetNotificationById(selected?.id || undefined);
  const [open, setOpen] = useState(false);

  const markAsRead = useMutation({
    mutationFn: async (notificationId: number) => {
      const res = await api.post("/admin/notifications/read", {
        notificationId,
      });
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

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
    onSuccess: async () => {
      setExtendDays("");
      setShowExtendForm(false);
      await queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
      setSelected(null);
      setOpen(false);
    },
  });

  const reject = useMutation({
    mutationFn: async ({ notificationId }: { notificationId: number }) => {
      const res = await api.post("/admin/actions/extend/reject", {
        notificationId,
      });
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
      setSelected(null);
      setOpen(false);
    },
  });

  const totalNotifications = notifications?.data?.data?.length || 0;

  const handleAcceptClick = () => {
    setShowExtendForm(true);
  };

  const handleExtendSubmit = () => {
    if (selected?.id && extendDays) {
      accept.mutate({
        notificationId: selected.id,
        extendDays: Number.parseInt(extendDays),
      });
    }
  };

  useNotificationSocket(() => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <TooltipBtn
          variant={"ghost"}
          title={t("Notification")}
          size="icon"
          className="relative" //
        >
          <Bell size={32} />
          {totalNotifications > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
              {totalNotifications}
            </Badge>
          )}
        </TooltipBtn>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[540px] p-0">
        {!selected ? (
          <>
            <SheetHeader className="px-6 py-4 border-b">
              <SheetTitle>{t("Notifications")}</SheetTitle>
            </SheetHeader>

            <ScrollArea className="h-[calc(100vh-80px)]">
              <Tabs
                defaultValue="EXTEND"
                className="w-full"
                onValueChange={() => setSelected(null)}
              >
                <TabsList className="m-4 w-[calc(100%-2rem)]">
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

                <TabsContent value="EXTEND" className="px-4 mt-0">
                  <div className="flex flex-col gap-2">
                    {(notifications?.data?.data || [])
                      .filter((n: any) => n.notificationType === "EXTEND")
                      .map((n: any) => (
                        <Card
                          key={n.id}
                          className="cursor-pointer transition hover:shadow-md hover:border-green-500"
                          onClick={() => {
                            setSelected({ id: n.id, type: "EXTEND" });
                            markAsRead.mutate(n.id); // ✅ Mark as read
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                <IoPersonCircleOutline className="w-10 h-10 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                  <p className="font-semibold text-sm">
                                    {n.name} {n.surname}
                                  </p>
                                  <Badge className="bg-green-100 text-green-700 text-xs flex-shrink-0">
                                    {t("uzaytirish")}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {n.date}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="WARNING" className="px-4 mt-0">
                  <div className="flex flex-col gap-2">
                    {(notifications?.data?.data || [])
                      .filter((n: any) => n.notificationType === "WARNING")
                      .map((n: any) => (
                        <Card
                          key={n.id}
                          className="cursor-pointer transition hover:shadow-md hover:border-red-500"
                          onClick={() => {
                            setSelected({ id: n.id, type: "WARNING" });
                            markAsRead.mutate(n.id); // ✅ Mark as read
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                <IoPersonCircleOutline className="w-10 h-10 text-red-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                  <p className="font-semibold text-sm">
                                    {n.bookTitle}
                                  </p>
                                  <Badge className="bg-red-100 text-red-700 text-xs flex-shrink-0">
                                    {t("warning")}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {n.date}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          </>
        ) : (
          <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelected(null);
                  setShowExtendForm(false);
                  setExtendDays("");
                }}
                className="flex-shrink-0"
              >
                <IoChevronBack className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">
                  {t("Notification detail")}
                </h3>
              </div>
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

            <ScrollArea className="flex-1 p-4">
              {detail && (
                <div className="space-y-4">
                  {selected.type === "EXTEND" && detail?.data?.student && (
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <IoPersonCircleOutline className="w-12 h-12 text-green-600 flex-shrink-0" />
                          <div className="space-y-2 flex-1">
                            <h4 className="font-semibold text-base">
                              {detail.data.student.name}{" "}
                              {detail.data.student.surname}
                            </h4>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>
                                <span className="text-foreground text-[16px]">
                                  {t("Faculty")}:
                                </span>{" "}
                                {detail.data.student.faculty}
                              </p>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>
                                <span className="text-foreground text-[16px]">
                                  {t("Degree")}:
                                </span>{" "}
                                {detail.data.student.degree}
                              </p>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>
                                <span className="text-foreground text-[16px]">
                                  {t("Card number")}:
                                </span>{" "}
                                {detail.data.student.cardNumber}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {detail?.data?.book && (
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <h4 className="font-bold text- mb-3">
                          {t("Book Information")}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[16px] text-muted-foreground min-w-[80px]">
                              {t("Title")}:
                            </span>
                            <span className="text-foreground">
                              {detail.data.book.title}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[16px] text-muted-foreground min-w-[80px]">
                              {t("Author")}:
                            </span>
                            <span className="text-foreground">
                              {detail.data.book.author}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[16px] text-muted-foreground min-w-[80px]">
                              {t("ISBN")}:
                            </span>
                            <span className="text-foreground">
                              {detail.data.book.isbn}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[16px] text-muted-foreground min-w-[80px]">
                              {t("Inventory Number")}:
                            </span>
                            <span className="text-foreground">
                              {detail.data.book.inventoryNumber}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[16px] text-muted-foreground min-w-[80px]">
                              {t("Epc")}:
                            </span>
                            <span className="text-foreground">
                              {detail.data.book.epc || "-"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selected.type === "EXTEND" && !showExtendForm && (
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={handleAcceptClick}
                        className="flex-1 bg-green-600 hover:bg-green-700"
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
                        variant="destructive"
                        className="flex-1"
                      >
                        {t("reject")}
                      </Button>
                    </div>
                  )}

                  {selected.type === "EXTEND" && showExtendForm && (
                    <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800">
                      <CardContent className="p-4 space-y-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="extendDays"
                            className="text-sm font-medium"
                          >
                            {t("yana necha kunga ijarani uzaytirmoqchisiz")}
                          </Label>
                          <Input
                            id="extendDays"
                            type="number"
                            min="1"
                            placeholder="0"
                            value={extendDays}
                            onChange={(e) => setExtendDays(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={handleExtendSubmit}
                            disabled={!extendDays || accept.isPending}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {accept.isPending
                              ? t("Loading...")
                              : t("ijara vaqtini uzaytirish")}
                          </Button>
                          <Button
                            onClick={() => {
                              setShowExtendForm(false);
                              setExtendDays("");
                            }}
                            variant="outline"
                            className="flex-1"
                          >
                            {t("Cancel")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selected.type === "WARNING" && (
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => {
                          if (selected.id) {
                            deleteNotification.mutate(selected.id, {
                              onSuccess: async () => {
                                await queryClient.invalidateQueries({
                                  queryKey: ["notifications"],
                                });
                                setSelected(null);
                                setOpen(false);
                              },
                            });
                          }
                        }}
                        variant="destructive"
                        className="flex-1"
                        disabled={deleteNotification.isPending}
                      >
                        {deleteNotification.isPending
                          ? t("Loading...")
                          : t("Delete")}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default NotificationHeader;
