"use client";
import Img from "@/app/_components/_global/Img";

export default function SignInBackground() {
  return (
    <>
      <Img
        src="/images/login-bg.png"
        loading="eager"
        className="absolute top-0 left-0 w-full h-full object-cover z-0 block lg:hidden"
      />
      <div className="overlay absolute inset-0 bg-black/40 lg:hidden"></div>
    </>
  );
}

export function SignInSideImage() {
  return (
    <div className=" hidden lg:block 2xl:flex-1/4 flex-1 h-full shadow-lg border-l border-gray-200 relative bg-transparent ">
      <Img
        src="/images/login-bg.png"
        loading="eager"
        className="absolute top-0 left-0 w-full h-full object-cover z-20"
      />
    </div>
  );
}
