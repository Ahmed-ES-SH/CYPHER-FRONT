"use client";

import { useAuth } from "@/src/modules/auth";
import Link from "next/link";
import { AiOutlineUser } from "react-icons/ai";
import { UserButton } from "./UserButton";

export default function SignInBtn() {
  const { isAuthenticated } = useAuth();
  return (
    <>
      {isAuthenticated ? (
        <UserButton />
      ) : (
        <Link
          href={"/signin"}
          className="flex items-center gap-2 cursor-pointer max-xl:hidden"
          id="user"
        >
          <AiOutlineUser className="size-7 text-icon-color" />
          <div className="flex flex-col items-start">
            <p className="text-[11px] text-icon-color">Sign in</p>
            <p className="text-[13px] font-semibold">Account</p>
          </div>
        </Link>
      )}
    </>
  );
}
