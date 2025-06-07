'use client';
import { Button } from '@/components/ui/button';
import { AlignLeft } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import AllDepartments from './AllDepartments';
import NavLinks from './NavLinks';
import { categories } from '@configs/constants';

const HeaderBottom = () => {
    const [show, setShow] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
    const closeTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleMouseEnter = () => {
        if (closeTimeout.current) {
            clearTimeout(closeTimeout.current);
            closeTimeout.current = null;
        }
        setShow(true);
    };

    const handleMouseLeave = () => {
        closeTimeout.current = setTimeout(() => {
            setShow(false);
            setHoveredCategory(null);
        }, 150);
    };

    const handleDropdownMouseEnter = () => {
        if (closeTimeout.current) {
            clearTimeout(closeTimeout.current);
            closeTimeout.current = null;
        }
    };

    const handleDropdownMouseLeave = () => {
        closeTimeout.current = setTimeout(() => {
            setShow(false);
            setHoveredCategory(null);
        }, 150);
    };

    return (
        <div>
            <div
                className={`w-full transition-all duration-500 ease-in-out ${
                    isSticky
                        ? 'fixed top-0 left-0 shadow-lg bg-bgPrimary z-50'
                        : 'relative'
                }`}
                style={{
                    transform: isSticky ? 'translateY(0)' : 'translateY(0px)',
                    transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
                }}
            >
                <div
                    className={`w-[80%] relative m-auto flex items-center justify-between ${
                        isSticky ? 'py-3' : 'py-0'
                    } transition-all duration-500`}
                >
                    {/* Cascading Dropdown */}
                    <div className="flex items-center">
                        <div
                            className={`w-[260px] ${
                                isSticky && '-mb-2'
                            } cursor-pointer flex items-center justify-between px-5 h-[50px] bg-major relative rounded-xl transition-colors duration-200 bg-primary`}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <Button
                                type="button"
                                className={`flex items-center gap-2 w-full bg-Bgprimary transition-colors duration-200 text-tBase`}
                                onClick={() => setShow((prev) => !prev)}
                            >
                                <AlignLeft />
                                <span
                                    className={`font-medium transition-colors duration-200`}
                                >
                                    All Departments
                                </span>
                            </Button>
                            {show && (
                                <div
                                    onMouseEnter={handleDropdownMouseEnter}
                                    onMouseLeave={handleDropdownMouseLeave}
                                >
                                    <AllDepartments
                                        categories={categories}
                                        hoveredCategory={hoveredCategory}
                                        setHoveredCategory={setHoveredCategory}
                                    />
                                </div>
                            )}
                        </div>
                        <NavLinks />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeaderBottom;
