"use client";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BiLoader } from "react-icons/bi";

export default function page() {
  const searchParams = useSearchParams();

  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"success" | "failure" | "">("");

  useEffect(() => {
    const handleCheckToken = async () => {
      try {
        const response = await axios.post(
          `http://localhost:5000/api/auth/verify-email?token=${token}`,
        );
        if (response.status === 200 || response.status === 201) {
          setStatus("success");
        }
      } catch (error) {
        console.log(error);
        setStatus("failure");
      } finally {
        setLoading(false);
      }
    };

    if (token) handleCheckToken();
  }, [token]);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) setToken(tokenParam);
  }, [token]);

  if (loading)
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <BiLoader className="size-48 text-primary animate-spin" />
      </div>
    );

  if (status == "success")
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-7xl text-green-500">Success</p>
      </div>
    );

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <p className="text-7xl text-red-500">Failure</p>
    </div>
  );
}
