import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/components/models/axios";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export const useBaseBooksCategory = () => {
  return useQuery({
    queryKey: ["base-book-category"],
    queryFn: async () => {
      const res = await api("/admin/base-book/categories");
      return res.data;
    },
  });
};

export const useUpdateBaseBooksCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await api.patch(`/admin/base-book/categories/${data.id}`, {
        name: data.name,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["base-book-category"],
      });
    },
  });
};

export const useCreateBaseBooksCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await api.post("/admin/base-book/categories", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["base-book-category"],
      });
    },
  });
};

export const useDeleteBaseBooksCategory = () => {
  const queryClient = useQueryClient();
  const t = useTranslations();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/base-book/categories/${id}`);
      return res.data;
    },
    onSuccess: (success: any) => {
      const seccessMessage =
        success?.response?.data?.message || success.message;
      toast.success(seccessMessage);
      queryClient.invalidateQueries({
        queryKey: ["base-book-category"],
      });
    },
    onError: (error: any) => {
      const errMessage = error?.response?.data?.message || error.message;
      toast.error(errMessage);
    },
  });
};
