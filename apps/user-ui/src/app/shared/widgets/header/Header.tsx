/* eslint-disable @nx/enforce-module-boundaries */
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { HeartIcon, User } from 'lucide-react';

import { Search } from 'lucide-react';
import React from 'react';
import HeaderBottom from './HeaderBottom';

const Header = () => {
  return (
    <div className="w-full border-b border-gray">
      <div className="w-[80%] py-5 m-auto flex items-center justify-between">
        <div className="">
          <Link href={'/'}>
            <span className="text-3xl">Eshop</span>
          </Link>
        </div>
        <div className="w-[50%] relative">
          <input
            type="text"
            placeholder="Search for products ..."
            className="w-full px-4 h-[55px] font-Poppins font-medium border-[2.5px] border-[#0055ff]"
          />

          <div className="w-[60px] cursor-pointer flex items-center justify-center h-[55px] bg-[#0055ff] absolute top-0 right-0">
            <Search color="white"></Search>
          </div>
        </div>

        <div className="flex flex-row items-center gap-5">
          <div className="flex flex-row items-center gap-2">
            <div className="flex w-[50px] h-[50px] items-center gap-8 justify-center rounded-full border border-[#898989]">
              <Link href={'/login'}>
                <User />
              </Link>
            </div>
            <Link href={'/login'}>
              <span className="black font-medium"> Hello, </span>
              <span className="font-semibold">Sign In</span>
            </Link>
          </div>
          <div className="flex relative w-[50px] h-[50px] items-center gap-8 justify-center rounded-full border border-[#898989]">
            <Link href={'/wishlist'}>
              <HeartIcon></HeartIcon>
              <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px] ">
                <span className="text-white font-medium text-sm items-center">
                  0
                </span>
              </div>
            </Link>
          </div>

          <div className="flex relative w-[50px] h-[50px] items-center gap-8 justify-center rounded-full border border-[#898989]">
            <Link href={'/wishlist'}>
              <ShoppingCart />
              <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px] ">
                <span className="text-white font-medium text-sm items-center">
                  0
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <HeaderBottom />
    </div>
  );
};

export default Header;
