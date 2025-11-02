import { api } from "@/components/models/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const buildSearchParams = (query: string, searchField: string) => {
  if (!query.trim()) return "";

  const trimmedQuery = query.trim();

  // fullInfo uchun — muallif va sarlavha
  if (searchField === "fullInfo") {
    // Oxirida ~ bo‘lsa — bu muallif qidiruvi
    if (trimmedQuery.endsWith("~")) {
      return `&field=fullInfo&query=${trimmedQuery}`;
    }

    // Boshida ~ bo‘lsa — bu sarlavha qidiruvi
    if (trimmedQuery.startsWith("~")) {
      return `&field=fullInfo&query=${trimmedQuery}`;
    }

    // Default holatda (muallif inputidan kelsa)
    return `&field=fullInfo&query=${trimmedQuery}~`;
  }

  // fullName uchun — ism va familiya
  if (searchField === "fullName") {
    if (trimmedQuery.endsWith("~")) {
      // ism
      return `&field=fullName&query=${trimmedQuery}`;
    }

    if (trimmedQuery.startsWith("~")) {
      // familiya
      return `&field=fullName&query=${trimmedQuery}`;
    }

    return `&field=fullName&query=${trimmedQuery}~`;
  }

  // Oddiy maydonlar uchun (book, inventoryNumber, epc va hokazo)
  return `&field=${searchField}&query=${trimmedQuery}`;
};

export const useCopiesBooks = ({
  pageSize,
  pageNumber,
  query,
  searchField = "inventoryNumber", // Default qiymat
  filter = "all",
  sortDirection = "desc",
}: {
  pageSize: number;
  pageNumber: number;
  query?: string;
  searchField?: "book" | "inventoryNumber" | "fullInfo" | "epc" | "fullName";
  filter?: "all" | "active" | "inactive";
  sortDirection?: "asc" | "desc";
}) =>
  useQuery({
    queryKey: [
      "copies-book",
      pageNumber,
      pageSize,
      query,
      searchField,
      filter,
      sortDirection,
    ],
    queryFn: async () => {
      const searchParams = query ? buildSearchParams(query, searchField) : "";
      const res = await api.get(
        `/admin/book-copies?pageSize=${pageSize}&pageNumber=${pageNumber}&filter=${filter}&sortDirection=${sortDirection}${searchParams}`,
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
  field,
  pageSize,
  pageNumber,
}: {
  query: string;
  field: string;
  pageSize: number;
  pageNumber: number;
}) =>
  useQuery({
    queryKey: ["copies-book-search", query, field, pageSize, pageNumber],
    queryFn: async () => {
      const res = await api.get(
        `/admin/book-copies/search?query=${query}&field=${field}&pageSize=10&pageNumber=${pageNumber}`,
      );
      return res.data;
    },
    enabled: !!query.trim(),
  });

export const useCreateCopiesBooks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      inventoryNumber: string;
      shelfLocation: string;
      notes: string;
      epc: string;
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
      epc: string;
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

export const useCopiesSelectOptions = () => {
  return useQuery({
    queryKey: ["copies-book-select"],
    queryFn: async () => {
      const res = await api("/admin/base-books/options");
      return res.data;
    },
  });
};

export const useCheckInventoryNumber = () => {
  return useMutation({
    mutationFn: async (inventoryNumber: string) => {
      const res = await api.get(
        `/admin/book-copies/check-inventory-number?inventoryNumber=${inventoryNumber}`,
      );
      return res.data;
    },
  });
};
