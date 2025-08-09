import { api } from "@/components/models/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useBaseBook = ({
  pageNum,
  pageSize,
  searchQuery,
}: {
  pageNum: number;
  pageSize: number;
  searchQuery?: string;
}) =>
  useQuery({
    queryKey: ["base-book", pageNum, pageSize, searchQuery],
    queryFn: async () => {
      const res = await api.get(
        `/admin/base-books?pageSize=${pageSize}&pageNumber=${pageNum}${searchQuery ? `&query=${searchQuery}&field=title` : ""}`,
      );
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

export const useUpdateBaseBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string | number;
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
      const res = await api.patch(`/admin/base-books/${data.id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["base-book"] });
    },
  });
};

export const useDeleteBaseBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | any) => {
      const res = await api.delete(`/admin/base-books/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["base-book"] });
    },
  });
};
