import { useQuery } from "@tanstack/react-query";
import { api } from "@/components/models/axios";

export const usePdfBooksList = () => {
  return useQuery({
    queryKey: ["pdf-books"],
    queryFn: async ({
      pageNum,
      pageSize,
    }: {
      pageNum: number;
      pageSize: number;
    }) => {
      const res = await api(
        `/pdf-books/list?pageNum=${pageNum}&pageSize=${pageSize}`,
      );
      return res.data;
    },
  });
};
