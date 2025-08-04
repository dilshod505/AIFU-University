import { useQuery } from "@tanstack/react-query";
import { api } from "@/components/models/axios";

export const usePdfBooksList = ({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) => {
  return useQuery({
    queryKey: ["pdf-books"],
    queryFn: async () => {
      const res = await api.get(
        `/client/pdf-books?pageNum=${pageNum}&pageSize=${pageSize}`,
      );
      return res.data;
    },
  });
};
