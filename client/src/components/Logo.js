import React from "react";
import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link
      to="/"
      className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200"
    >
      <img src="/logo.jpeg" alt="Logo" height="120" width="120" className="" />
    </Link>
  );
};

export default Logo;
