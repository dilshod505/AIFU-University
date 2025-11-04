import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/components/models/axios";
import { toast } from "sonner";

export const useAdministrators = ({
  pageNumber,
  sortDirection,
}: {
  pageNumber: number;
  sortDirection: "asc" | "desc";
}) =>
  useQuery({
    queryKey: ["administrators", pageNumber, sortDirection],
    queryFn: async () => {
      const res = await api.get(
        `/super-admin/admins?pageNumber=${pageNumber}&size=10&sortDirection=${sortDirection}`,
      );
      return res.data;
    },

    select: (data: Record<string, any>) => data?.data,
  });

// export const useAdminDelete = () => {
//   return useMutation({
//     mutationFn: async (id: string | number) => {
//       const res = await api.delete(`/super-admin/admins/${id}`);
//       return res.data; // <-- natijani qaytaramiz
//     },
//   });
// };

export const useAdminDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/super-admin/admins/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["administrators"] });
    },
  });
};

export const useCreateAdministrator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await api.post("/super-admin/admins/initiate", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["administrators"] });
    },
  });
};

export const useActivateAccount = () => {
  const queryClient = useQueryClient(); // 👈 qo'shamiz

  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await api.post(`/super-admin/admins/confirm`, data);
      return res.data;
    },
    onSuccess: () => {
      // ✅ jadvalni yangilaydi
      queryClient.invalidateQueries({ queryKey: ["administrators"] });
    },
  });
};

export const useResendActivationCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await api.post(`/admin/password-reset/initiate`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["administrators"] });
      toast.success("Kod qayta yuborildi");
    },
  });
};
