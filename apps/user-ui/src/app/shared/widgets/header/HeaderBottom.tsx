'use client';
import { AlignLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const HeaderBottom = () => {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.screenY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('sroll', handleScroll);
  }, []);

  return (
    <div>
      <div
        className={`w-full transitions-all duration-300 ${
          isSticky ? 'fixed top-0 left-0 z-[100] ' : 'relative'
        }`}
      >
        <div
          className={`w-[80%] relative m-auto flex items-center justify-between ${
            isSticky ? 'py-3' : 'py-0'
          }`}
        >
          {/* {all drop down } */}
          <div
            className={`w-[260px] ${
              isSticky && '-mb-2'
            } cursor-pointer flex items-center justify-between px-5 h-[50px] bg-bgPrimary`}
            onClick={() => setShow(!show)}
          >
            <div className="flex items-center gap-2 ">
              <AlignLeft color="white" />
              <span className=" text-[white] font-medium">
                All Departments{' '}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
