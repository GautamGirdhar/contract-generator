import React from "react";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="z-10 text-xl flex-grow">
      <ul className="flex items-center justify-end gap-8 md:gap-16">
        <li>
          <Link to="/about" className="hover:text-[#ff9149] transition-colors">
            About Us
          </Link>
        </li>
        <li>
          <Link
            to="/contact"
            className="hover:text-[#ff9149] transition-colors"
          >
            Contact Us
          </Link>
        </li>
        <li>
          <Link
            to="/products"
            className="hover:text-[#ff9149] transition-colors"
          >
            Products
          </Link>
        </li>
        <li>
          <Link to="/signin" className="hover:text-[#ff9149] transition-colors">
            Sign In
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
