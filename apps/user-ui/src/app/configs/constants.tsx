// All departments categories constants
export interface Category {
  name: string;
  sub?: { name: string }[];
}

export const categories: Category[] = [
  {
    name: 'Electronics',
    sub: [
      { name: 'Mobiles' },
      { name: 'Laptops' },
      { name: 'Accessories' },
      { name: 'Gaming' },
    ],
  },
  { name: 'Fashion' },
  { name: 'Home and Kitchen' },
  { name: 'Sports and Fitness' },
];

// Navigation links for header
export interface NavLink {
  name: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'Shops', href: '/shops' },
  { name: 'Offers', href: '/offers' },
  { name: 'Become A Seller', href: '/become-a-seller' },
];
