import { useQuery } from "@tanstack/react-query";
import { api } from "@/components/models/axios";

export const useStudents = () =>
  useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await api.get("/student?pageSize=100000");
      return res.data;
    },
  });
