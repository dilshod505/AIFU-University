"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useGetNotifications } from "@/components/models/queries/notification";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Notifications = () => {
  const t = useTranslations();
  const { data: notifications } = useGetNotifications();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const list = notifications?.data?.data || [];

  // Faqat userlari bor notificationlarni olish
  const users = useMemo(() => {
    const uniqueUsers: Record<string, string> = {};
    list.forEach((n: any) => {
      if (n.name && n.surname) {
        uniqueUsers[`${n.name} ${n.surname}`] = `${n.name} ${n.surname}`;
      }
    });
    return Object.values(uniqueUsers);
  }, [list]);

  // Filterlangan notificationlar
  const filtered = useMemo(() => {
    if (!selectedUser) return list;
    return list.filter(
      (n: any) =>
        `${n.name} ${n.surname}`.toLowerCase() === selectedUser.toLowerCase(),
    );
  }, [list, selectedUser]);

  return (
    <div>
      <h1 className="text-2xl font-semibold py-5">{t("Notifications")}</h1>

      {/* User tanlash */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Button
          variant={selectedUser ? "outline" : "default"}
          onClick={() => setSelectedUser(null)}
        >
          {t("All")}
        </Button>
        {users.map((u) => (
          <Button
            key={u}
            variant={selectedUser === u ? "default" : "outline"}
            onClick={() => setSelectedUser(u)}
          >
            {u}
          </Button>
        ))}
      </div>

      {/* Tabs EXTEND va WARNING */}
      <Tabs defaultValue="EXTEND" className="w-full">
        <TabsList className="mb-5">
          <TabsTrigger value="EXTEND">Extend</TabsTrigger>
          <TabsTrigger value="WARNING">Warning</TabsTrigger>
        </TabsList>

        {/* EXTEND */}
        <TabsContent value="EXTEND">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered
              .filter((n: any) => n.notificationType === "EXTEND")
              .map((n: any) => (
                <Card
                  key={n.id}
                  className={`${
                    n.isRead ? "opacity-60" : "border-green-500"
                  } shadow-sm`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {n.name} {n.surname}
                        </p>
                        <p className="text-sm text-gray-500">{n.date}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-700"
                      >
                        EXTEND
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* WARNING */}
        <TabsContent value="WARNING">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered
              .filter((n: any) => n.notificationType === "WARNING")
              .map((n: any) => (
                <Card
                  key={n.id}
                  className={`${
                    n.isRead ? "opacity-60" : "border-red-500"
                  } shadow-sm`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{n.bookTitle}</p>
                        <p className="text-sm text-gray-500">
                          {n.bookAuthor} ({n.bookCode})
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{n.date}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-red-100 text-red-700"
                      >
                        WARNING
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
