"use client";

import { api } from "@/components/models/axios";
import { BookingCard } from "@/components/pages/super-admin/bookings/booking-card";
import { BookingSearch } from "@/components/pages/super-admin/bookings/booking-search";
import { BorrowBookForm } from "@/components/pages/super-admin/bookings/borrow-book-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bookingKeys, useBookings } from "@/hooks/use-bookings";
import { Booking } from "@/types/booking";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

export default function Bookings() {
  const [displayedBookings, setDisplayedBookings] = useState<Booking[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const queryClient = useQueryClient();
  const {
    data: bookings = [],
    isLoading,
    error,
    refetch,
  } = useBookings({ pageNum: 1, pageSize: 100000 });
  const currentBookings = isSearching ? displayedBookings : bookings;

  const handleSearchResults = (results: Booking[]) => {
    setDisplayedBookings(results);
    setIsSearching(true);
  };

  const handleClearSearch = () => {
    setDisplayedBookings([]);
    setIsSearching(false);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    refetch();
  };

  const handleViewDetails = (bookingId: string) => {
    window.open(`/admin/booking/${bookingId}`, "_blank");
  };

  const stats = {
    total: bookings.length,
    borrowed: bookings.filter(
      (b: Record<string, any>) => b.status === "borrowed",
    ).length,
    overdue: bookings.filter((b: Record<string, any>) => b.status === "overdue")
      .length,
    returned: bookings.filter(
      (b: Record<string, any>) => b.status === "returned",
    ).length,
  };

  if (error) {
    return (
      <div className="cont">
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
    <div className="cont space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kutubxona Admin Paneli</h1>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Yangilash
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Jami Bookinglar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Olingan Kitoblar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.borrowed}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Muddati O'tgan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.overdue}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Qaytarilgan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.returned}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">Bookinglar</TabsTrigger>
          <TabsTrigger value="new-booking">Yangi Booking</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <BookingSearch
            onResults={handleSearchResults}
            onClear={handleClearSearch}
          />

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Yuklanmoqda...</p>
            </div>
          ) : currentBookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {isSearching
                  ? "Qidiruv natijasi topilmadi"
                  : "Hech qanday booking topilmadi"}
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
          <div className="max-w-md">
            <BorrowBookForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
