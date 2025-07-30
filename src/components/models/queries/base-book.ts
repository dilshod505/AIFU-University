import { api } from "@/components/models/axios";
import { useQuery } from "@tanstack/react-query";

export const useBaseBook = () =>
  useQuery({
    queryKey: ["base-book"],
    queryFn: async () => {
      const res = await api.get("/admin/base-books?pageSize=100000");
      return res.data;
    },
  });

export const useBaseBookId = () =>
  useQuery({
    queryKey: ["base-book"],
    queryFn: async (id: string | any) => {
      const res = await api.get(`/admin/base-books/${id}`);
      return res.data;
    },
  });

import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateBaseBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      categoryId: number;
      author: string;
      title: string;
      series: string;
      titleDetails: string;
      publicationYear: number;
      publisher: string;
      publicationCity: string;
      isbn: string;
      pageCount: number;
      language: string;
      udc: string;
    }) => {
      const res = await api.post("/admin/base-books", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["base-book"] });
    },
  });
};
