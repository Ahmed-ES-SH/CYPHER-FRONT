"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { useAuthStore } from "@/app/store/useAuthStore";
import { LuLoaderCircle } from "react-icons/lu";
import Cookies from "js-cookie";
import axios from "axios";

export default function CallbackPage() {
  const { setUser } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      async function handleLogin() {
        try {
          await axios.post("/api/auth/callback", { token });

          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}${API_ENDPOINTS.USER.PROFILE}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          setUser(res.data);
          router.replace("/");
        } catch (error) {
          console.error("Login failed");
        }
      }
      handleLogin();
    }
  }, [token, router, setUser]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <LuLoaderCircle className="text-primary animate-spin" size={100} />
    </div>
  );
}
