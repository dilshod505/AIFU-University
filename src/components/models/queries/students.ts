import { api } from "@/components/models/axios";
import { FilterType } from "@/components/pages/super-admin/students";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useStudents = ({
  filter,
  pageNumber,
  size,
  sortDirection,
  field,
  query,
}: {
  filter: "all" | "active" | "inactive";
  pageNumber: number;
  size: number;
  sortDirection: "asc" | "desc";
  field?: "id" | "cardNumber" | "fullName";
  query?: string | number;
}) =>
  useQuery({
    queryKey: [
      "students",
      filter,
      pageNumber,
      size,
      sortDirection,
      field,
      query,
    ],
    queryFn: async () => {
      const res = await api.get("/admin/students", {
        params: {
          status: filter,
          pageNumber,
          size,
          sortDirection,
          ...(field && query ? { field, query } : {}),
        },
      });
      return res.data;
    },
    select: (data: Record<string, any>) => data?.data,
  });

export const useExcelExport = () => {
  return useMutation({
    mutationFn: async (params: Record<string, any>) => {
      const res = await api.get("/admin/backup/student", {
        params, // ✅ query params
        responseType: "blob", // ✅ fayl olish
      });
      return res.data;
    },
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "students.xlsx"); // fayl nomi
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  });
};

export const useExcelExportShablon = () => {
  return useMutation({
    mutationFn: async (params: Record<string, any>) => {
      const res = await api.get("/super-admin/students/import/template", {
        params, // ✅ query params
        responseType: "blob", // ✅ fayl olish
      });
      return res.data;
    },
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "students-shablon.xlsx"); // fayl nomi
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  });
};

export const useUpdateStudents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await api.patch(`/admin/students/${data.id}`, data);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(data);
    },
  });
};

export const useDeleteStudents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | any) => {
      const res = await api.delete(`/admin/students/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(data);
    },
  });
};

export const useCreateStudents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ payload }: { payload: Record<string, any> }) => {
      const res = await api.post("/admin/students", payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(data);
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

export const useImportStudents = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post(
        "/super-admin/students/import/import",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return res.data;
    },
  });
};

export const useDeactivateGraduates = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post(
        "/super-admin/students/lifecycle/deactivate-graduates",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return res.data;
    },
  });
};
