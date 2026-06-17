import { linksLeft } from "@/constants/Links";
import MiniDrop from "./MiniDrop";

export default function TopPart() {
  const langs = ["English", "Spanish", "German"];
  const Currencies = ["USD", "INR", "GBP"];
  return (
    <>
      <div id="top-part" className="flex items-center justify-between relative">
        <ul className="flex items-center gap-5 px-3 max-xl:hidden">
          {linksLeft.map((link, index) => (
            <li
              className="text-[14px] font-light cursor-pointer hover:font-medium duration-300"
              key={index}
            >
              {link}
            </li>
          ))}
        </ul>
        <div className="max-xl:m-auto">
          <ul className="flex items-center gap-3 h-fit px-2">
            <li className="text-[14px] cursor-pointer max-md:text-[10px] whitespace-nowrap">
              Order Tracking
            </li>
            <li className="langs z-9999999">
              <MiniDrop options={langs} />
            </li>
            <li className="flex flex-col   self-center  cursor-pointer mo">
              <MiniDrop options={Currencies} />
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
