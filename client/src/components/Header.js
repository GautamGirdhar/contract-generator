import React from "react";
import Logo from "./Logo";
import Navigation from "./Navigation";

const Header = () => {
  return (
    <header className="border-b border-primary-900 px-8 py-5 w-full">
      <div className="flex justify-between items-center max-w-7xl mx-auto w-full gap-8">
        <div className="flex-shrink-0">
          <Logo />
        </div>
        <div className="flex-grow flex justify-end">
          <Navigation />
        </div>
      </div>
    </header>
  );
};

export default Header;
