import { useQuery } from "@tanstack/react-query";
import { api } from "@/components/models/axios";

export const useBooking = () =>
  useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const res = await api.get("/admin/booking?pageNumber=100000");
      return res.data;
    },
  });

export const useBookingsByStudent = (studentId?: number, filter = "all") => {
  return useQuery({
    queryKey: ["bookings", studentId, filter],
    queryFn: async () => {
      if (!studentId) return null;
      const res = await api.get("/admin/booking", {
        params: {
          field: "student",
          query: studentId,
          filter,
          pageNum: 1,
          pageSize: 10,
          sortDirection: "desc",
        },
      });
      return res.data.data; // {data, totalPages, ...}
    },
    enabled: !!studentId,
  });
};

export const useByIdBookingDetail = (id: number | null) => {
  return useQuery({
    queryKey: ["booking-by-id", id],
    queryFn: async () => {
      if (!id) return null; // id yo'q bo'lsa, fetch qilmaydi
      const res = await api.get(`/admin/booking/${id}`);
      return res.data;
    },
    enabled: !!id, // faqat id mavjud bo'lsa ishlaydi
  });
};

export const useBookingByStudentId = (studentId: number | null) =>
  useQuery({
    queryKey: ["bookings-student-id", studentId],
    queryFn: async () => {
      const res = await api.get(`/admin/booking/student/${studentId}`);
      return res.data;
    },
    enabled: !!studentId, // studentId bo‘lmasa request yubormaydi
  });
