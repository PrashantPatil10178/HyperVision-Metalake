import api from "@/services/AxiosInterceptor";
import { Client, Account, OAuthProvider } from "appwrite";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1") // Replace with your Appwrite endpoint
  .setProject("67cbf95d00187ba7bcf5");

const account = new Account(client);

export const appwriteAuth = {
  login: async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get(); // Get user session
      console.log("Logged in as:", user);

      await api.post("/users/sync", {
        appwriteId: user.$id,
        email: user.email,
      });

      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  register: async (email: string, password: string, name: string) => {
    try {
      await account.create("unique()", email, password, name);
      const user = await appwriteAuth.login(email, password); // Auto-login after register

      // Sync user data with backend
      await api.post("/users/sync", {
        appwriteId: user.$id,
        email: user.email,
      });

      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  getSession: async () => {
    try {
      return await account.get();
    } catch {
      return null; // No active session
    }
  },

  logout: async () => {
    try {
      await account.deleteSession("current");
      return true;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  loginWithOAuth: async (provider: "Google" | "Github") => {
    try {
      const OAuth =
        provider === "Google" ? OAuthProvider.Google : OAuthProvider.Github;
      await account.createOAuth2Session(
        OAuth,
        "http://localhost:5173",
        "http://localhost:5173/login"
      );

      const user = await account.get();

      // Sync user data with backend
      await api.post("/users/sync", {
        appwriteId: user.$id,
        email: user.email,
      });

      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Login anonymously
   */
  loginAnonymously: async () => {
    try {
      const anonymously = await account.createAnonymousSession();
      console.log("Anonymously logged in as:", anonymously);
      const user = await account.get();
      console.log("Logged in as:", user);

      // Sync user data with backend
      await api.post("/users/sync", {
        appwriteId: user.$id,
        email: user.email,
      });

      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Reset Password
   */
  resetPassword: async (email: string) => {
    try {
      await account.createRecovery(
        email,
        "http://localhost:5173/reset-password"
      );
      return true;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
};
