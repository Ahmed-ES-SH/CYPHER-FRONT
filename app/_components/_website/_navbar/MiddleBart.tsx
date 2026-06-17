import React from "react";
import Img from "../../_global/Img";
import Link from "next/link";
import Barsbtn from "./Barsbtn";
import InputSearch from "./_searchInput/InputSearch";
import SearchOverlay from "./_searchInput/SearchOverlay";
import CartProducts from "./CartProducts";
import WishListProducts from "./WishListProducts";
import SignInBtn from "./_auth/Signinbtn";

export default async function MiddleBart() {
  return (
    <>
      <div className="w-full flex items-center justify-between gap-4 mt-6">
        {/* Bars Icons */}
        <Barsbtn />
        {/* ////////////////// */}
        <Link className="block" href={"/"} id="logo">
          <Img
            src="/logo.png"
            className="xl:w-72 lg:w-48 w-32"
            alt="logo"
            loading="eager"
          />
        </Link>
        {/* InputSearch - visible on xl+ */}
        <div className="max-xl:hidden w-full">
          <InputSearch />
        </div>

        {/* //////////// */}
        <div id="icons" className="flex items-center gap-4">
          {/* SearchOverlay icon - visible below xl */}
          <SearchOverlay />
          {/* Signin Link */}
          <SignInBtn />
          {/* Heart Icon && FavoriteList */}
          <WishListProducts />
          {/* Cart Icon && Cart products */}
          <CartProducts />
        </div>
      </div>
    </>
  );
}
