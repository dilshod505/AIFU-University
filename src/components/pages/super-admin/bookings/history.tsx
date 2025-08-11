"use client";

import { useState } from "react";
import { Archive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHistory } from "@/hooks/use-bookings";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import dayjs from "dayjs";

// A new card component for history records
function HistoryCard({ record }: { record: Record<string, any> }) {
  const t = useTranslations();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="">
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
  const [displayedHistory, setDisplayedHistory] = useState<
    Record<string, any>[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const queryClient = useQueryClient();
  const { data: history, isLoading, error, refetch } = useHistory();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("arxivlangan ijaralar")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("arxivlangan ijaralar royxati")} ({history?.length || 0})
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t("loading")}</p>
        </div>
      ) : history?.length === 0 ? (
        <div className="text-center py-12">
          <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            {isSearching
              ? t("Qidiruv natijasi topilmadi")
              : t("Arxivda yozuvlar mavjud emas")}
          </p>
          <p className="text-sm text-muted-foreground">
            {!isSearching &&
              t("Kitoblar qaytarilgandan so'ng bu yerda ko'rinadi")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {history?.map((record: Record<string, any>) => (
            <HistoryCard key={record.id} record={record as any} />
          ))}
        </div>
      )}
    </div>
  );
}
