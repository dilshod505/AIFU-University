import { useQuery } from "@tanstack/react-query";
import { api } from "@/components/models/axios";

export const useEBooks = (query: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ["books", query],
    queryFn: async () => {
      const response = await api.get(`/categories`, query);
      return response.data;
    },
  });
};

export const useCreateEBooks = () => {
  return useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const response = await api.post(`/categories`);
      return response.data;
    },
  });
};

export const useUpdateEBooks = () => {
  return useQuery({
    queryKey: ["books"],
    queryFn: async (id: string | any) => {
      const response = await api.put(`/categories/${id}`);
      return response.data;
    },
  });
};
