import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/components/models/axios";
import { toast } from "sonner";

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/admin/categories");
      return res.data;
    },
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await api.post("/admin/categories", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string | number; name: string }) => {
      const res = await api.put(`/admin/categories/${data.id}`, {
        name: data.name,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | any) => {
      const res = await api.delete(`/admin/categories/${id}`);
      return res.data;
    },
    onSuccess: (success: any) => {
      const seccessMessage =
        success?.response?.data?.message || success.message;
      toast.success(seccessMessage);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: any) => {
      const errMessage = error?.response?.data?.message || error.message;
      toast.error(errMessage);
    },
  });
};
