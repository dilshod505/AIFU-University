import { api } from "@/components/models/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const buildSearchParams = (query: string, searchField: string) => {
  if (!query.trim()) return "";

  const trimmedQuery = query.trim();

  // Detect if query contains both author and title (separated by space, comma, or ~)
  const hasMultipleParts = /[\s,~]/.test(trimmedQuery);

  if (searchField === "fullInfo") {
    if (hasMultipleParts) {
      // Split by space, comma, or ~ and join with ~
      const parts = trimmedQuery
        .split(/[\s,~]+/)
        .filter((part) => part.length > 0);
      if (parts.length >= 2) {
        // Both author and title: author~title
        return `&field=fullInfo&query=${parts[0]}~${parts.slice(1).join(" ")}`;
      } else {
        // Single term: just author
        return `&field=fullInfo&query=${parts[0]}`;
      }
    } else {
      // Single word - could be author or title
      // If it starts with ~, treat as title only
      if (trimmedQuery.startsWith("~")) {
        return `&field=fullInfo&query=${trimmedQuery}`;
      } else {
        // Default to author search
        return `&field=fullInfo&query=${trimmedQuery}`;
      }
    }
  } else if (searchField === "fullName") {
    if (hasMultipleParts) {
      // Split by space, comma, or ~ and join with ~
      const parts = trimmedQuery
        .split(/[\s,~]+/)
        .filter((part) => part.length > 0);
      if (parts.length >= 2) {
        // Both first and last name: first~last
        return `&field=fullName&query=${parts[0]}~${parts.slice(1).join(" ")}`;
      } else {
        // Single term: just first name
        return `&field=fullName&query=${parts[0]}`;
      }
    } else {
      // Single word
      if (trimmedQuery.startsWith("~")) {
        return `&field=fullName&query=${trimmedQuery}`;
      } else {
        return `&field=fullName&query=${trimmedQuery}`;
      }
    }
  } else {
    // For other fields like inventoryNumber, epc, book - simple exact match
    return `&field=${searchField}&query=${trimmedQuery}`;
  }
};

export const useCopiesBooks = ({
  pageSize,
  pageNumber,
  query,
  searchField = "inventoryNumber", // Added searchField parameter
  filter = "all",
  sortDirection = "desc",
}: {
  pageSize: number;
  pageNumber: number;
  query?: string;
  searchField?: "book" | "inventoryNumber" | "fullInfo" | "epc" | "fullName"; // Added searchField type
  filter?: "all" | "active" | "inactive";
  sortDirection?: "asc" | "desc";
}) =>
  useQuery({
    queryKey: [
      "copies-book",
      pageNumber,
      pageSize,
      query,
      searchField, // Added searchField to query key
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
      book: number;
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
