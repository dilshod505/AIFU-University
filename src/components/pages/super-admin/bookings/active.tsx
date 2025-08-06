"use client";

import { useCallback, useState } from "react";
import { Book, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Booking } from "@/types/booking";
import { bookingKeys, useBookings } from "@/hooks/use-bookings";
import { useQueryClient } from "@tanstack/react-query";
import { BookingSearch } from "@/components/pages/super-admin/bookings/booking-search";
import { BookingCard } from "@/components/pages/super-admin/bookings/booking-card";
import { BorrowBookForm } from "@/components/pages/super-admin/bookings/borrow-book-form";

export default function ActiveBookingsPage() {
  const [displayedBookings, setDisplayedBookings] = useState<Booking[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const queryClient = useQueryClient();
  const { data: bookings = [], isLoading, error, refetch } = useBookings();

  const activeBookings = bookings.filter(
    (booking: Record<string, any>) =>
      booking.status === "borrowed" || booking.status === "overdue",
  );

  const currentBookings = isSearching ? displayedBookings : activeBookings;

  const handleSearchResults = useCallback((results: Booking[]) => {
    const activeResults = results.filter(
      (booking) =>
        booking.status === "borrowed" || booking.status === "overdue",
    );
    setDisplayedBookings(activeResults);
    setIsSearching(true);
  }, []);

  const handleClearSearch = useCallback(() => {
    setDisplayedBookings([]);
    setIsSearching(false);
  }, []);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    refetch();
  }, [queryClient, refetch]);

  const handleViewDetails = useCallback((bookingId: string) => {
    window.open(`/admin/booking/${bookingId}`, "_blank");
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">
            Bookinglarni yuklashda xatolik yuz berdi
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
          <h1 className="text-3xl font-bold">Aktiv Bookinglar</h1>
          <p className="text-muted-foreground mt-1">
            Hozirda olingan va muddati o'tgan kitoblar ({currentBookings.length}
            )
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Yangilash
        </Button>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Ro'yxat</TabsTrigger>
          <TabsTrigger value="new-booking">
            <Plus className="h-4 w-4 mr-2" />
            Yangi Booking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <BookingSearch
            onResults={handleSearchResults}
            onClear={handleClearSearch}
            searchType="bookings"
          />

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
            </div>
          ) : currentBookings.length === 0 ? (
            <div className="text-center py-12">
              <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                {isSearching
                  ? "Qidiruv natijasi topilmadi"
                  : "Aktiv bookinglar mavjud emas"}
              </p>
              <p className="text-sm text-muted-foreground">
                {!isSearching &&
                  'Yangi booking yaratish uchun "Yangi Booking" tugmasini bosing'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {currentBookings.map((booking: Record<string, any>) => (
                <BookingCard
                  key={booking.id}
                  booking={booking as any}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="new-booking">
          <div className="max-w-md mx-auto">
            <BorrowBookForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
