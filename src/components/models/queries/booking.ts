import { useQuery } from "@tanstack/react-query";
import { api } from "@/components/models/axios";

export const useBooking = () =>
  useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const res = await api.get("/admin/booking?pageSize=100000");
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

export const useBookingStudentId = () =>
  useQuery({
    queryKey: ["bookings-student-id"],
    queryFn: async (id: string | any) => {
      const res = await api.get(`/admin/booking/student/${id}`);
      return res.data;
    },
  });

export const useBookingFilter = () =>
  useQuery({
    queryKey: ["bookings-filter"],
    queryFn: async (id: string | any) => {
      const res = await api.get(`/admin/booking/filter`);
      return res.data;
    },
  });
