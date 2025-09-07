"use client";

import { useMemo, useState } from "react";
import { Archive, FileDown, PenSquareIcon, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHistory } from "@/hooks/use-bookings";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import dayjs from "dayjs";
import { api } from "@/components/models/axios";
import { Button } from "@/components/ui/button";
import MyTable, { IColumn } from "@/components/my-table";
import { Input } from "@/components/ui/input";
import TooltipBtn from "@/components/tooltip-btn";
import DeleteActionDialog from "@/components/delete-action-dialog";
import { toast } from "sonner";

// A new card component for history records
function HistoryCard({ record }: { record: Record<string, any> }) {
  const t = useTranslations();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">
          {record.bookTitle} ({record.inventoryNumber})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="font-medium text-muted-foreground">Muallif:</span>
            <p className="font-medium">{record.author}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">
              Foydalanuvchi:
            </span>
            <p className="font-medium text-sm">
              {record.name} {record.surname}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="font-medium text-muted-foreground">Olingan:</span>
            <p className="font-medium">
              {dayjs(record.givenAt).format("DD-MM-YYYY")}
            </p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">
              {t("Qaytarilgan")}:
            </span>
            <p className="font-medium text-green-600">
              {dayjs(record.returnedAt).format("DD-MM-YYYY")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HistoryPage() {
  const t = useTranslations();
  const [isSearching, setIsSearching] = useState(false);
  const { data: history, isLoading } = useHistory();

  // ✅ Excel export mutation
  const exportExcel = useMutation({
    mutationFn: async () => {
      const res = await api.get("/admin/backup/history", {
        responseType: "blob", // Excel blob fayl sifatida keladi
      });

      // Faylni browserda yuklab olish
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "history.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    onSuccess: () => toast.success(t("Succses download excel")),
  });

  const columns = useMemo<IColumn[]>(
    () => [
      {
        key: "index",
        dataIndex: "index",
        title: "#",
        width: 300,
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        key: "name",
        dataIndex: "name",
        title: t("name"),
        width: 350,
      },
      {
        key: "surname",
        dataIndex: "surname",
        title: t("Surname"),
        width: 400,
      },
      {
        key: "author",
        dataIndex: "author",
        title: t("Author"),
        width: 400,
      },
      {
        key: "bookTitle",
        dataIndex: "bookTitle",
        title: t("Book title"),
        width: 400,
      },
      {
        key: "inventoryNumber",
        dataIndex: "inventoryNumber",
        title: t("Inventory Number"),
        width: 400,
      },
      {
        key: "givenAt",
        dataIndex: "givenAt",
        title: t("Given At"),
        width: 400,
      },
      {
        key: "dueDate",
        dataIndex: "dueDate",
        title: t("Due Date"),
        width: 400,
      },
      {
        key: "returnedAt",
        dataIndex: "returnedAt",
        title: t("Returned At"),
        width: 400,
      },
    ],
    [t],
  );

  return (
    <div className={"mt-6"}>
      <MyTable
        title={
          <div>
            <h1 className="text-3xl font-bold">{t("arxivlangan ijaralar")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("arxivlangan ijaralar royxati")} ({history?.length || 0})
            </p>
          </div>
        }
        columns={columns}
        isLoading={isLoading}
        dataSource={history}
        pagination={false}
        header={
          <div className={"flex items-center justify-center gap-2"}>
            <div>
              <Input
                placeholder={t("Search history")}
                value={""}
                // onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
            </div>
            <div>
              <TooltipBtn
                title={
                  exportExcel.isPending
                    ? t("Yuklanmoqda...")
                    : t("Excelga yuklab olish")
                }
                onClick={() => exportExcel.mutate()}
                disabled={exportExcel.isPending}
              >
                <FileDown />
              </TooltipBtn>
            </div>
          </div>
        }
      />

      {/* ✅ Excelga export tugmasi */}
    </div>
  );
}
