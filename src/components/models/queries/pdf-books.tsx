import { api } from "@/components/models/axios";
import { useMutation, useQuery } from "@tanstack/react-query";

export const usePdfBooksList = ({
  pageNum,
  pageSize,
  category,
}: {
  pageNum: number;
  pageSize: number;
  category?: number;
}) => {
  return useQuery({
    enabled: !!pageNum && !!pageSize,
    queryKey: ["pdf-books", pageNum, pageSize, category],
    queryFn: async () => {
      const res = await api.get(
        `/client/pdf-books?pageNumber=${pageNum}&pageSize=10${category ? `&category=${category}` : ""}`
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
    select: (data) => data.data,
  });
};

export const usePdfDownload = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.get(`/client/download/${id}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `book-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    },
  });
};
