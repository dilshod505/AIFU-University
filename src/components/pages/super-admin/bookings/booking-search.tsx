"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchBookings, useSearchHistory } from "@/hooks/use-bookings";
import { useTranslations } from "next-intl";

interface BookingSearchProps {
  onResults: (results: any[]) => void;
  onClear: () => void;
  searchType?: "bookings" | "history";
}

export function BookingSearch({
  onResults,
  onClear,
  searchType = "bookings",
}: BookingSearchProps) {
  const t = useTranslations();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const { data: bookingResults, isLoading: isLoadingBookings } =
    useSearchBookings(
      searchType === "bookings" ? debouncedQuery : "",
      "inventoryNumber", // bu backend kutayotgan field nomi
    );

  const { data: historyResults, isLoading: isLoadingHistory } =
    useSearchHistory(
      searchType === "history" ? debouncedQuery : "",
      searchType === "history" ? "userID" : "", // yoki "cardNumber"
    );

  const isLoading = isLoadingBookings || isLoadingHistory;
  const searchResults =
    searchType === "bookings" ? bookingResults : historyResults;

  // Memoize the callback to prevent infinite re-renders
  const handleResults = useCallback(
    (results: any[]) => {
      onResults(results);
    },
    [onResults],
  );

  const handleClearSearch = useCallback(() => {
    onClear();
  }, [onClear]);

  // Update results when search data changes
  useEffect(() => {
    if (debouncedQuery && searchResults) {
      handleResults(searchResults);
    } else if (!debouncedQuery) {
      handleClearSearch();
    }
  }, [searchResults, debouncedQuery, handleResults, handleClearSearch]);

  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    onClear();
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={t("Qidirish")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isLoading && (
        <div className="flex items-center px-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}
