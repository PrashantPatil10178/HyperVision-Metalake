import { account } from "@/lib/appwrite";
import api from "@/services/AxiosInterceptor";
import { useQuery } from "@tanstack/react-query";
interface UserData {
  id: string;
  appwriteId: string;
  email: string;
  name: string;
  instanceId: null;
  createdAt: string;
  credentials: {
    id: string;
    userId: string;
    provider: string;
    accessKey: string;
    secretKey: string;
    createdAt: string;
  }[];
  buckets: {
    id: string;
    userId: string;
    name: string;
    provider: string;
    format: null;
    metadata: null;
    createdAt: string;
    updatedAt: string;
  }[];
  queryHistory: any[];
}
export default function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async (): Promise<UserData> => {
      const user = await account.get();
      console.log("user", user);
      const userData = await api.get(`users/${user.$id}`);
      return userData.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
