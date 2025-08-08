import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/components/models/axios";

export const useCopiesBooks = ({
  pageSize,
  pageNumber,
}: {
  pageSize: number;
  pageNumber: number;
}) =>
  useQuery({
    queryKey: ["copies-book", pageNumber, pageSize],
    queryFn: async () => {
      const res = await api.get(
        `/admin/book-copies?pageSize=${pageSize}&pageNumber=${pageNumber}`,
      );
      return res.data;
    },
  });

export const useCopiesBooksId = ({
  id,
}: {
  id: string | number | undefined | null;
}) =>
  useQuery({
    queryKey: ["copies-book-id", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/admin/book-copies/${id}`);
      return res.data;
    },
  });

export const useCopiesBooksSearch = ({
  query,
  pageSize,
  pageNumber,
}: {
  query: string;
  pageSize: number;
  pageNumber: number;
}) =>
  useQuery({
    queryKey: ["copies-book-search", query, pageSize, pageNumber],
    queryFn: async () => {
      const res = await api.get(
        `/admin/book-copies/search?query=${query}&pageSize=${pageSize}&pageNumber=${pageNumber}`,
      );
      return res.data;
    },
  });

export const useCreateCopiesBooks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      inventoryNumber: string;
      shelfLocation: string;
      notes: string;
      baseBookId: number;
    }) => {
      const res = await api.post("/admin/book-copies", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["copies-book"] });
    },
  });
};

export const useUpdateCopiesBooks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string | number;
      inventoryNumber: string;
      shelfLocation: string;
      notes: string;
      baseBookId: number;
    }) => {
      const res = await api.patch(`/admin/book-copies/${data.id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["copies-book"] });
    },
  });
};

export const useDeleteCopiesBooks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | any) => {
      const res = await api.delete(`/admin/book-copies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["copies-book"] });
    },
  });
};
