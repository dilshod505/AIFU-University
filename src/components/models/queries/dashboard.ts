import { useQuery } from "@tanstack/react-query";
import { api } from "@/components/models/axios";

export const useStudentsTop = () =>
  useQuery({
    queryKey: ["studentsTop"],
    queryFn: async () => {
      const res = await api.get("/admin/statistics/students/top");
      return res.data;
    },
  });

export const useStudentsCount = () =>
  useQuery({
    queryKey: ["studentsCount"],
    queryFn: async () => {
      const res = await api.get("/admin/statistics/students/count");
      return res.data;
    },
  });

export const useBooksTop = () =>
  useQuery({
    queryKey: ["booksTop"],
    queryFn: async () => {
      const res = await api.get("/admin/statistics/books/top");
      return res.data;
    },
  });

export const useBooksCount = () =>
  useQuery({
    queryKey: ["booksCount"],
    queryFn: async () => {
      const res = await api.get("/admin/statistics/books/count");
      return res.data;
    },
  });

export const useBookingsToday = () =>
  useQuery({
    queryKey: ["bookingsToday"],
    queryFn: async () => {
      const res = await api.get("/admin/statistics/bookings/today");
      return res.data;
    },
  });

export const useBookingsTodayOverdue = () =>
  useQuery({
    queryKey: ["bookingsTodayOverdue"],
    queryFn: async () => {
      const res = await api.get("/admin/statistics/bookings/today/overdue");
      return res.data;
    },
  });

export const useBookingsPerMonth = () =>
  useQuery({
    queryKey: ["bookingsPerMonth"],
    queryFn: async () => {
      const res = await api.get(
        "/admin/statistics/bookings/perMonth?year=2025",
      );
      return res.data;
    },
  });

export const useBookingsPerDay = () =>
  useQuery({
    queryKey: ["bookingsPerDay"],
    queryFn: async () => {
      const res = await api.get(
        "/admin/statistics/bookings/perDay?month=8&year=2025",
      );
      return res.data;
    },
  });

export const useBookingOverdue = () => {
  return useQuery({
    queryKey: ["bookingOverdue"],
    queryFn: async () => {
      const res = await api.get("/admin/statistics/bookings/overdue");
      return res.data;
    },
  });
};

export const useBookingsDiagram = () =>
  useQuery({
    queryKey: ["bookingsDiagram"],
    queryFn: async () => {
      const res = await api.get("/admin/statistics/bookings/diagram");
      return res.data.data;
    },
  });

export const useBookingsCount = () =>
  useQuery({
    queryKey: ["bookingsCount"],
    queryFn: async () => {
      const res = await api.get("/admin/statistics/bookings/count");
      return res.data;
    },
  });

export const useBookCopiesCount = () =>
  useQuery({
    queryKey: ["bookCopiesCount"],
    queryFn: async () => {
      const res = await api.get("/admin/statistics/book/copies/count");
      return res.data;
    },
  });

export const useAverageUsage = () =>
  useQuery({
    queryKey: ["averageUsage"],
    queryFn: async () => {
      const res = await api.get("/admin/statistics/average/usage");
      return res.data;
    },
  });

export const useAdminbActivity = () =>
  useQuery({
    queryKey: ["adminbActivity"],
    queryFn: async () => {
      const res = await api.get("/admin/admin-statistics/admins-activity");
      return res.data;
    },
  });
