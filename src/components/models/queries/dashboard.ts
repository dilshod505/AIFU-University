import { useQuery } from "@tanstack/react-query";
import { api } from "@/components/models/axios";

export const useAverageUsage = () => {
  useQuery({
    queryKey: ["statics"],
    queryFn: async () => {
      const res = await api.get("/statistics/average/usage");
      return res.data;
    },
  });
};

export const useBookCopiesCount = () => {
  useQuery({
    queryKey: ["statics"],
    queryFn: async () => {
      const res = await api.get("/statistics/book/copies/count");
      return res.data;
    },
  });
};

export const useBookingsCount = () => {
  useQuery({
    queryKey: ["statics"],
    queryFn: async () => {
      const res = await api.get("/statistics/bookings/count");
      return res.data;
    },
  });
};

export const useBookingsDiagram = () => {
  useQuery({
    queryKey: ["statics"],
    queryFn: async () => {
      const res = await api.get("/statistics/bookings/diagram");
      return res.data;
    },
  });
};

export const useBookingsPerDay = () => {
  useQuery({
    queryKey: ["statics"],
    queryFn: async () => {
      const res = await api.get("/statistics/bookings/perDay");
      return res.data;
    },
  });
};

export const useBookingsPerMonth = () => {
  useQuery({
    queryKey: ["statics"],
    queryFn: async () => {
      const res = await api.get("/statistics/bookings/perMonth");
      return res.data;
    },
  });
};

export const useBookingsToday = () => {
  useQuery({
    queryKey: ["statics"],
    queryFn: async () => {
      const res = await api.get("/statistics/bookings/today");
      return res.data;
    },
  });
};

export const useBookingsTodayOverdue = () => {
  useQuery({
    queryKey: ["statics"],
    queryFn: async () => {
      const res = await api.get("/statistics/bookings/today/overdue");
      return res.data;
    },
  });
};

export const useBooksCount = () => {
  useQuery({
    queryKey: ["statics"],
    queryFn: async () => {
      const res = await api.get("/statistics/books/count");
      return res.data;
    },
  });
};

export const useBooksTop = () => {
  useQuery({
    queryKey: ["statics"],
    queryFn: async () => {
      const res = await api.get("/statistics/books/top");
      return res.data;
    },
  });
};

export const useStudentsCount = () => {
  useQuery({
    queryKey: ["statics"],
    queryFn: async () => {
      const res = await api.get("/statistics/students/count");
      return res.data;
    },
  });
};

export const useStudentsTop = () => {
  useQuery({
    queryKey: ["statics"],
    queryFn: async () => {
      const res = await api.get("/statistics/students/top");
      return res.data;
    },
  });
};
