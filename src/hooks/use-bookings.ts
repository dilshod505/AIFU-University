import { api } from "@/components/models/axios";
import {
  extendBooking,
  getBookingById,
  getBookings,
  getHistoryById,
  returnBook,
  searchBookings,
  searchHistory,
} from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // sonner'dan toast import qilindi

interface HistoryParams {
  studentId?: number;
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: "asc" | "desc";
}

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

export const useHistoryByStudent = ({
  studentId,
  pageNumber = 1,
  pageSize = 10,
  sortDirection = "desc",
}: HistoryParams) => {
  return useQuery({
    queryKey: ["history", studentId, pageNumber, pageSize, sortDirection],
    queryFn: async () => {
      if (!studentId) return null;
      const res = await api.get("/admin/history", {
        params: {
          field: "student",
          query: studentId,
          pageNumber,
          pageSize,
          sortDirection,
        },
      });
      return res.data.data;
    },
    enabled: !!studentId,
  });
};

export function useHistory({
  searchField,
  searchQuery,
  pageNumber,
  pageSize,
  sortDirection = "asc",
}: {
  searchField?: "fullName" | "cardNumber" | "inventoryNumber";
  searchQuery?: string;
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: [
      "history",
      searchField,
      searchQuery,
      pageNumber,
      pageSize,
      sortDirection,
    ],
    queryFn: async () => {
      const params: Record<string, any> = {
        pageNumber,
        pageSize,
        sortDirection,
      };

      // 🔹 Faqat qidiruv bo‘lsa, search param qo‘shamiz
      if (searchQuery && searchQuery.trim() !== "") {
        params.field = searchField;
        params.query = searchQuery;
      }

      const response = await api.get(`/admin/history`, { params });
      return response.data;
    },
    select: (data) => ({
      list: data?.data?.data || [],
      totalElements: data?.data?.totalElements || 0,
      totalPages: data?.data?.totalPages || 0,
      currentPage: data?.data?.currentPage || 1,
    }),
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
