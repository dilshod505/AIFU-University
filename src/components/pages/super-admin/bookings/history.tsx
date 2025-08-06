"use client";

import { useCallback, useState } from "react";
import { Archive, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoryRecord } from "@/types/booking";
import { historyKeys, useHistory } from "@/hooks/use-bookings";
import { useQueryClient } from "@tanstack/react-query";
import { BookingSearch } from "@/components/pages/super-admin/bookings/booking-search";

// A new card component for history records
function HistoryCard({ record }: { record: HistoryRecord }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{record.bookTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="font-medium text-muted-foreground">Muallif:</span>
            <p className="font-medium">{record.bookAuthor}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">
              Foydalanuvchi:
            </span>
            <p className="font-medium">{record.userName}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="font-medium text-muted-foreground">Olingan:</span>
            <p className="font-medium">
              {new Date(record.borrowDate).toLocaleDateString("uz-UZ")}
            </p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">
              Qaytarilgan:
            </span>
            <p className="font-medium text-green-600">
              {new Date(record.returnDate!).toLocaleDateString("uz-UZ")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HistoryPage() {
  const [displayedHistory, setDisplayedHistory] = useState<HistoryRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const queryClient = useQueryClient();
  const { data: history = [], isLoading, error, refetch } = useHistory();

  const currentHistory = isSearching ? displayedHistory : history;

  // Memoize callback functions to prevent infinite re-renders
  const handleSearchResults = useCallback((results: HistoryRecord[]) => {
    setDisplayedHistory(results);
    setIsSearching(true);
  }, []);

  const handleClearSearch = useCallback(() => {
    setDisplayedHistory([]);
    setIsSearching(false);
  }, []);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: historyKeys.all });
    refetch();
  }, [queryClient, refetch]);

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">
            Tarixni yuklashda xatolik yuz berdi
          </p>
          <Button onClick={handleRefresh}>Qayta urinish</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Arxiv</h1>
          <p className="text-muted-foreground mt-1">
            Qaytarilgan kitoblar tarixi ({currentHistory.length})
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Yangilash
        </Button>
      </div>

      <BookingSearch
        onResults={handleSearchResults}
        onClear={handleClearSearch}
        searchType="history"
      />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
        </div>
      ) : currentHistory.length === 0 ? (
        <div className="text-center py-12">
          <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            {isSearching
              ? "Qidiruv natijasi topilmadi"
              : "Arxivda yozuvlar mavjud emas"}
          </p>
          <p className="text-sm text-muted-foreground">
            {!isSearching && "Kitoblar qaytarilgandan so'ng bu yerda ko'rinadi"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {currentHistory?.map((record: Record<string, any>) => (
            <HistoryCard key={record.id} record={record as any} />
          ))}
        </div>
      )}
    </div>
  );
}
