"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  useGetNotifications,
  useGetNotificationById,
} from "@/components/models/queries/notification";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Notifications = () => {
  const t = useTranslations();
  const { data: notifications } = useGetNotifications();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: detail } = useGetNotificationById(selectedId || undefined);

  const list = notifications?.data?.data || [];

  return (
    <div>
      <h1 className="text-2xl font-semibold py-5">{t("Notifications")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* LEFT SIDE: LIST */}
        <div className="md:col-span-1">
          <Tabs defaultValue="EXTEND" className="w-full">
            <TabsList className="mb-5 w-full">
              <TabsTrigger value="EXTEND" className="flex-1">
                Extend
              </TabsTrigger>
              <TabsTrigger value="WARNING" className="flex-1">
                Warning
              </TabsTrigger>
            </TabsList>

            <TabsContent value="EXTEND">
              <div className="flex flex-col gap-3">
                {list
                  .filter((n: any) => n.notificationType === "EXTEND")
                  .map((n: any) => (
                    <Card
                      key={n.id}
                      className={`cursor-pointer transition hover:shadow-md ${
                        selectedId === n.id ? "border-blue-500" : ""
                      }`}
                      onClick={() => setSelectedId(n.id)}
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
                            EXTEND
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="WARNING">
              <div className="flex flex-col gap-3">
                {list
                  .filter((n: any) => n.notificationType === "WARNING")
                  .map((n: any) => (
                    <Card
                      key={n.id}
                      className={`cursor-pointer transition hover:shadow-md ${
                        selectedId === n.id ? "border-blue-500" : ""
                      }`}
                      onClick={() => setSelectedId(n.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{n.bookTitle}</p>
                            <p className="text-xs text-gray-500">{n.date}</p>
                          </div>
                          <Badge className="bg-red-100 text-red-700">
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

        {/* RIGHT SIDE: DETAIL */}
        <div className="md:col-span-2">
          {!selectedId || !detail ? (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border p-10 text-center">
              <div>
                <div className="text-gray-400 text-5xl mb-3">📋</div>
                <h2 className="font-semibold text-gray-600">
                  No notification selected
                </h2>
                <p className="text-sm text-gray-500">
                  Click on a notification to view its details
                </p>
              </div>
            </div>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="p-5 space-y-4">
                <h2 className="text-xl font-semibold">
                  {t("Notification detail")}
                </h2>
                <div>
                  <h3 className="font-medium mb-1">👤 Student</h3>
                  <p>
                    {detail.data.student.name} {detail.data.student.surname}
                  </p>
                  <p className="text-sm text-gray-500">
                    {detail.data.student.faculty}
                  </p>
                  <p className="text-sm text-gray-500">
                    {detail.data.student.degree}
                  </p>
                  <p className="text-sm text-gray-500">
                    Card: {detail.data.student.cardNumber}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">📚 Book</h3>
                  <p>{detail.data.book.title}</p>
                  <p className="text-sm text-gray-500">
                    {detail.data.book.author}
                  </p>
                  <p className="text-sm text-gray-500">
                    ISBN: {detail.data.book.isbn}
                  </p>
                  <p className="text-sm text-gray-500">
                    Inv: {detail.data.book.inventoryNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    EPC: {detail.data.book.epc}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
