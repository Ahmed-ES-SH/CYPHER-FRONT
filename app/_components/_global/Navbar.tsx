import TopPart from "../_website/_navbar/TopPart";
import MiddleBart from "../_website/_navbar/MiddleBart";
import BottomPart from "../_website/_navbar/BottomPart";
import NavbarWrapper from "./NavbarWrapper";
import FetchData from "@/app/helpers/FetchData";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { cookies } from "next/headers";

export default async function Navbar() {
  const tokenValue = await (
    await cookies()
  ).get(process.env.NEXT_PUBLIC_TOKEN_NAME!);

  const user = tokenValue && (await FetchData(API_ENDPOINTS.USER.PROFILE));

  return (
    <NavbarWrapper currentUser={user}>
      <div className="relative pb-3">
        <div className="w-full h-[.5px] absolute bottom-0 left-0 bg-gray-300 opacity-65"></div>
        <div className="c-container pt-2">
          {/* Top Part From Navbar */}
          <TopPart />
          {/* MiddlePart From Navbar */}
          <MiddleBart />
          {/* BottomPart From Navbar */}
          <BottomPart />
        </div>
      </div>
    </NavbarWrapper>
  );
}
