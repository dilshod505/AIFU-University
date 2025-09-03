import { api } from "@/components/models/axios";
import { FilterType } from "@/components/pages/super-admin/users";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useStudents = ({
  filter,
  pageNumber,
  size,
  sortDirection,
}: {
  filter: FilterType;
  pageNumber: number;
  size: number;
  sortDirection: "asc" | "desc";
}) =>
  useQuery({
    queryKey: ["students", filter, pageNumber, size, sortDirection],
    queryFn: async () => {
      const res = await api.get(
        `/admin/students?status=${filter}&pageNumber=${pageNumber}&pageSize=${size}&sortDirection=${sortDirection}`
      );
      return res.data;
    },
    select: (data: Record<string, any>) => data?.data,
  });

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
        `/super-admin/admins?pageNumber=${pageNumber}&size=10&sortDirection=${sortDirection}`
      );
      return res.data;
    },
    select: (data: Record<string, any>) => data?.data,
  });

export const useCreateAdministrator = () => {
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await api.post("/super-admin/admins", data);
      return res.data;
    },
  });
};

export const useExcelExport = () => {
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await api.get("/admin/backup/student", data);
      return res.data;
    },
  });
};

export const useUpdateStudents = () => {
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await api.patch(`/admin/students/${data.id}`, data);
      return res.data;
    },
  });
};

export const useDeleteStudents = () => {
  return useMutation({
    mutationFn: async (id: string | any) => {
      const res = await api.delete(`/admin/students/${id}`);
      return res.data;
    },
  });
};

export const useCreateStudents = () => {
  return useMutation({
    mutationFn: async ({ payload }: { payload: Record<string, any> }) => {
      const res = await api.post("/admin/students", payload);
      return res.data;
    },
  });
};

export const useGetById = () => {
  return useMutation({
    mutationFn: async (id: string | any) => {
      const res = await api.get(`/admin/students/${id}`);
      return res.data;
    },
  });
};
