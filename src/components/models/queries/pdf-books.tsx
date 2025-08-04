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
    queryKey: ["pdf-books", pageNum, pageSize],
    queryFn: async () => {
      const res = await api.get(
        `/client/pdf-books?pageNumber=${pageNum}&pageSize=${pageSize}`,
      );
      return res.data;
    },
  });
};

export const usePdfBookId = ({ id }: { id: string | number }) => {
  return useQuery({
    queryKey: ["pdf-book"],
    queryFn: async () => {
      const res = await api.get(`/client/pdf-book/${id}`);
      return res.data;
    },
  });
};
