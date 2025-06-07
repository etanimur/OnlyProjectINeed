import { ChevronRight } from 'lucide-react';
import React from 'react';

interface Category {
    name: string;
    sub?: { name: string }[];
}

interface AllDepartmentsProps {
    categories: Category[];
    hoveredCategory: string | null;
    setHoveredCategory: (name: string | null) => void;
}

const AllDepartments: React.FC<AllDepartmentsProps> = ({
    categories,
    hoveredCategory,
    setHoveredCategory,
}) => {
    return (
        <div className="absolute left-0 top-full mt-2 w-full bg-Primary shadow-lg z-50 rounded border ">
            <ul className="py-2">
                {categories.map((cat) => (
                    <li
                        key={cat.name}
                        className="relative group"
                        onMouseEnter={() => setHoveredCategory(cat.name)}
                        onMouseLeave={() => setHoveredCategory(null)}
                    >
                        <div
                            className={`flex items-center justify-between px-4 py-2 transition-colors duration-150 bg-bgPrimary cursor-pointer ${
                                hoveredCategory === cat.name
                                    ? 'bg-primary text-tBase'
                                    : 'text-tBase hover:bg-primary hover:text-tBase'
                            }`}
                        >
                            <span>{cat.name}</span>
                            {'sub' in cat && cat.sub && (
                                <ChevronRight className="w-4 h-4 ml-2" />
                            )}
                        </div>
                        {'sub' in cat &&
                            cat.sub &&
                            hoveredCategory === cat.name && (
                                <ul className="absolute left-full top-0 min-w-[180px] bg-bgPrimary border border-major shadow-lg rounded py-2 z-50">
                                    {cat.sub.map((subcat) => (
                                        <li
                                            key={subcat.name}
                                            className="px-4 py-2 hover:bg-major hover:text-tBase text-tBase whitespace-nowrap transition-colors duration-150 cursor-pointer"
                                        >
                                            {subcat.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AllDepartments;
