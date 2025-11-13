import { api } from "@/components/models/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useBaseBook = ({
  pageNum,
  field,
  query,
  sortDirection,
}: {
  pageNum: number;
  field?: string;
  query?: string | number;
  sortDirection?: "asc" | "desc";
}) =>
  useQuery({
    queryKey: ["base-book", pageNum, field, query, sortDirection],
    queryFn: async () => {
      const res = await api.get(
        `/admin/base-books?pageSize=10&pageNumber=${pageNum}&sortDirection=${sortDirection}${
          query ? `&field=${field}&query=${query}` : ""
        }`,
      );
      return res.data;
    },
  });

export const useBaseBookId = (id: number | null, options = {}) =>
  useQuery({
    queryKey: ["base-book-id", id], // id queryKey ichida
    queryFn: async () => {
      const res = await api.get(`/admin/base-books/${id}`);
      return res.data;
    },
    enabled: !!id, // id bo‘lmasa query ishlamasin
    ...options,
  });

export const useCreateBaseBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      categoryId: number;
      author?: string;
      title: string;
      series?: string;
      titleDetails?: string;
      publicationYear?: number;
      publisher?: string;
      publicationCity?: string;
      isbn?: string;
      pageCount: number;
      language?: string;
      udc?: string;
    }) => {
      const payload = {
        categoryId: data.categoryId,
        author: data.author || "",
        title: data.title || "",
        series: data.series || "",
        titleDetails: data.titleDetails || "",
        publicationYear: data.publicationYear || 0,
        publisher: data.publisher || "",
        publicationCity: data.publicationCity || "",
        isbn: data.isbn || "",
        pageCount: data.pageCount || 0,
        language: data.language || "",
        udc: data.udc || "",
      };
      const res = await api.post("/admin/base-books", payload);
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
    mutationFn: async ({
      id,
      categoryId,
      ...rest
    }: {
      id: string | number;
      categoryId: number;
      author?: string;
      title: string;
      series?: string;
      titleDetails?: string;
      publicationYear?: number | string;
      publisher?: string;
      publicationCity?: string;
      isbn?: string;
      pageCount: number | string;
      language?: string;
      udc?: string;
    }) => {
      const payload = {
        author: rest.author || "",
        title: rest.title || "",
        series: rest.series || "",
        titleDetails: rest.titleDetails || "",
        publicationYear: Number(rest.publicationYear) || 0,
        publisher: rest.publisher || "",
        publicationCity: rest.publicationCity || "",
        isbn: rest.isbn || "",
        pageCount: Number(rest.pageCount) || 0,
        language: rest.language || "",
        udc: rest.udc || "",
        categoryId: Number(categoryId),
      };

      const res = await api.patch(`/admin/base-books/${id}`, payload);
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

export const useUploadExcelBook = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/super-admin/book/import/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
  });
};

export const useImportExcelBook = () => {
  return useMutation({
    mutationFn: async (params: Record<string, any>) => {
      const res = await api.get("/admin/backup/book", {
        params, // ✅ query params
        responseType: "blob", // ✅ fayl olish
      });
      return res.data;
    },
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "book.xlsx"); // fayl nomi
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  });
};

export const useAllExcelImport = () => {
  return useMutation({
    mutationFn: async (params: Record<string, any>) => {
      const res = await api.get("/super-admin/book/import/template", {
        params, // ✅ query params
        responseType: "blob", // ✅ fayl olish
      });
      return res.data;
    },
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "book.xlsx"); // fayl nomi
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  });
};
