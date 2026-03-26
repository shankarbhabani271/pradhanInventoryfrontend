// import { queryKeys } from "@/constant/query.constant";
import { AuthAPI } from "@/controller/auth/auth.controller";
import { useQuery } from "@tanstack/react-query";

export const useRefreshQuery = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: AuthAPI.refresh,
    refetchInterval: 24 * 60 * 60 * 1000, 
    refetchIntervalInBackground: true,
    retry: false,
    refetchOnWindowFocus: false,
  });
};