import { useQuery } from "@tanstack/react-query";
import { api } from "@/components/models/axios";

export const useBaseBooksCategory = () => {
  return useQuery({
    queryKey: ["base-books-category"],
    queryFn: async () => {
      const res = await api("/admin/base-book/categories");
      return res.data;
    },
  });
};
