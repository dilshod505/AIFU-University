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

export const useBookingId = () =>
  useQuery({
    queryKey: ["bookings-id"],
    queryFn: async (id: string | any) => {
      const res = await api.get(`/admin/booking/${id}`);
      return res.data;
    },
  });

export const useBookingByStudentId = (studentId: number | null) =>
  useQuery({
    queryKey: ["bookings-student-id", studentId],
    queryFn: async () => {
      const res = await api.get(`/admin/booking/student/${studentId}`);
      return res.data;
    },
    enabled: !!studentId, // studentId bo‘lmasa request yubormaydi
  });
