import { create } from "zustand";
import axiosInstance from "../api/axios";

interface LoginData {
  email: string;
  password: string;
}

export const useAuthStore = create((set) => {
  return {
    user: null,
    loading: true,

    login: async (data: LoginData) => {
      try {
        const res = await axiosInstance.post("/auth/login", data);
        if (!res.data.user) {
          throw new Error("Login failed");
        }

        set({ user: res.data.user, token: res.data.token });
        localStorage.setItem("token", res.data.token);
      } catch (error) {
        console.log(error);
      }
    },
    profile: async () => {
      try {
        const res = await axiosInstance.get("/user/profile");
        if (res.data) {
          set({ user: res.data.user });
        }
      } catch (error) {
        console.log(error);
      } finally {
        set({ loading: false });
      }
    },
  };
});
