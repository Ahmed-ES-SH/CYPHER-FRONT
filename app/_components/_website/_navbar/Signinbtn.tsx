"use client";

import Link from "next/link";
import { AiOutlineUser } from "react-icons/ai";

function UserButton() {
  return <div></div>;
}

export default function SignInBtn() {
  const user = false;
  return (
    <>
      {user ? (
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
