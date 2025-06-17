/* eslint-disable @nx/enforce-module-boundaries */
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { HeartIcon, User } from 'lucide-react';

import { Search } from 'lucide-react';
import React from 'react';
import HeaderBottom from './components/HeaderBottom';
import { Button } from '../../../components/ui/button';
import { ModeToggle } from './components/ThemeToggle';
const Header = () => {
    return (
        <div className="w-full border-b bg-foreground pb-1 border-gray">
            <div className="w-[80%] py-5 m-auto flex items-center justify-between">
                <div className="">
                    <Link href={'/'}>
                        <span className="text-3xl">Eshop</span>
                    </Link>
                </div>
                {/* search component */}
                <div className="w-[50%] relative rounded-lg  ">
                    <input
                        type="text"
                        placeholder="Search for products ..."
                        className="w-full rounded-lg px-4 h-[55px] font-Poppins font-medium border-[2.5px] border-primary dark:border-none  "
                    />

                    <div className="w-[65px] cursor-pointer flex items-center justify-center h-[55px] bg-primary absolute right-0 rounded-lg z-[100] top-0 ">
                        <Search></Search>
                    </div>
                </div>
                &nbsp;
                <div className="flex flex-row items-center gap-5">
                    <div className="flex flex-row items-center gap-2">
                        <Button
                            className="rounded-full w-[50x] h-[50px]"
                            variant={'outline'}
                        >
                            <Link href={'/login'}>
                                <User />
                            </Link>
                        </Button>

                        <Link href={'/login'}>
                            <span className="black font-medium"> Hello, </span>
                            <span className="font-semibold">Sign In</span>
                        </Link>
                    </div>
                    <Button
                        size={'icon'}
                        className="rounded-full w-[50px] h-[50px] relative"
                        variant={'outline'}
                    >
                        <Link href={'/wishlist'}>
                            <HeartIcon></HeartIcon>
                            <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px] ">
                                <span className="text-white font-medium text-sm items-center">
                                    0
                                </span>
                            </div>
                        </Link>
                    </Button>
                    <Button
                        className="rounded-full w-[50px] h-[50px] relative"
                        variant={'outline'}
                    >
                        <Link href={'/cart'}>
                            <ShoppingCart />
                            <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px] ">
                                <span className="text-white font-medium text-sm items-center">
                                    0
                                </span>
                            </div>
                        </Link>
                    </Button>

                    <div className="flex flex-wrap items-center w-[50px] h-[50px] gap-2 md:flex-row">
                        <ModeToggle></ModeToggle>
                    </div>
                </div>
            </div>
            <HeaderBottom />
        </div>
    );
};

export default Header;
