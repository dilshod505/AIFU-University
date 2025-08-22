import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // sonner'dan toast import qilindi
import {
  extendBooking,
  getBookingById,
  getBookings,
  getHistory,
  getHistoryById,
  returnBook,
  searchBookings,
  searchHistory,
} from "@/lib/api";

// Query keys
export const bookingKeys = {
  all: ["bookings"] as const,
  lists: () => [...bookingKeys.all, "list"] as const,
  list: (filters: string) => [...bookingKeys.lists(), { filters }] as const,
  details: () => [...bookingKeys.all, "detail"] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  search: (query: string) => [...bookingKeys.all, "search", query] as const,
};

export const historyKeys = {
  all: ["history"] as const,
  lists: () => [...historyKeys.all, "list"] as const,
  list: (filters: string) => [...historyKeys.lists(), { filters }] as const,
  details: () => [...historyKeys.all, "detail"] as const,
  detail: (id: string) => [...historyKeys.details(), id] as const,
  search: (query: string) => [...historyKeys.all, "search", query] as const,
};

// Get all bookings
export function useBookings({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) {
  return useQuery({
    queryKey: bookingKeys.lists(),
    queryFn: () => getBookings(pageNum, pageSize),
    select: (data) => data?.data?.data || [],
  });
}

// Get booking by ID
export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => getBookingById(id),
    enabled: !!id,
  });
}

// Search bookings
export function useSearchBookings(query: string, field: string) {
  return useQuery({
    queryKey: bookingKeys.search(`${field}-${query}`),
    queryFn: () => searchBookings(query, field),
    enabled: !!query.trim(),
  });
}

// Return book mutation
export function useReturnBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: returnBook,
    onSuccess: (data, bookingId) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: historyKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: bookingKeys.detail(bookingId),
      });
      toast.success("Muvaffaqiyat", {
        description: "Kitob muvaffaqiyatli qaytarildi",
      });
    },
    onError: (error) => {
      const errorMessage =
        (error as any)?.response?.data?.message ||
        "Kitob qaytarishda xatolik yuz berdi";
      toast.error("Xatolik", { description: errorMessage });
    },
  });
}

// Extend booking mutation
export function useExtendBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: extendBooking,
    onSuccess: (data, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: bookingKeys.detail(bookingId),
      });
      toast.success("Muvaffaqiyat", {
        description: "Booking muddati uzaytirildi",
      });
    },
    onError: (error) => {
      const errorMessage =
        (error as any)?.response?.data?.message ||
        "Booking uzaytirishda xatolik yuz berdi";
      toast.error("Xatolik", { description: errorMessage });
    },
  });
}

// History hooks
export function useHistory() {
  return useQuery({
    queryKey: historyKeys.lists(),
    queryFn: getHistory,
    select: (data) => data?.data?.data || [],
  });
}

export function useHistoryRecord(id: string) {
  return useQuery({
    queryKey: historyKeys.detail(id),
    queryFn: () => getHistoryById(id),
    enabled: !!id,
  });
}

export function useSearchHistory(query: string, field: string) {
  const isQueryValid = !!query.trim();
  const isUserIDValid = field === "userID" ? /^\d+$/.test(query) : true;

  return useQuery({
    queryKey: ["search-history", query, field],
    queryFn: () => searchHistory(query, field),
    enabled: isQueryValid && isUserIDValid,
  });
}
