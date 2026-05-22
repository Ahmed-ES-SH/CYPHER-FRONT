import TopPart from "../_website/_navbar/TopPart";
import MiddleBart from "../_website/_navbar/MiddleBart";
import BottomPart from "../_website/_navbar/BottomPart";
import NavbarWrapper from "./NavbarWrapper";

export default async function Navbar() {
  return (
    <NavbarWrapper>
      <div className="relative pb-3">
        <div className="w-full h-[.5px] absolute bottom-0 left-0 bg-gray-300 opacity-65"></div>
        <div className="c-container pt-2">
          <TopPart />
          <MiddleBart />
          <BottomPart />
        </div>
      </div>
    </NavbarWrapper>
  );
}
