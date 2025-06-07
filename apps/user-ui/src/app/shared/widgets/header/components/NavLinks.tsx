import React from 'react';
import { navLinks } from '@/configs/constants';

const NavLinks = () => {
  return (
    <nav className="flex gap-6 ml-8">
      {navLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          className="text-tBase hover:text-primary transition-colors duration-200 font-medium"
        >
          {link.name}
        </a>
      ))}
    </nav>
  );
};

export default NavLinks;
