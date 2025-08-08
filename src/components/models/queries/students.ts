import { useQuery } from "@tanstack/react-query";
import { api } from "@/components/models/axios";
import { FilterType } from "@/components/pages/super-admin/users";

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
        `/admin/students?filter=${filter}&pageNumber=${pageNumber}&size=${size}&sortDirection=${sortDirection}`,
      );
      return res.data;
    },
    select: (data: Record<string, any>) => data?.data,
  });

export const useAdministrators = ({
  pageNumber,
  size,
  sortDirection,
}: {
  pageNumber: number;
  size: number;
  sortDirection: "asc" | "desc";
}) =>
  useQuery({
    queryKey: ["administrators", pageNumber, size, sortDirection],
    queryFn: async () => {
      const res = await api.get(
        `/super-admin/admins?pageNumber=${pageNumber}&size=${size}&sortDirection=${sortDirection}`,
      );
      return res.data;
    },
    select: (data: Record<string, any>) => data?.data,
  });
