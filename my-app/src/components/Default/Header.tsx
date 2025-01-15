import React from "react";
import HeaderProps from "../../types/Header.interface"
import { Link } from "react-router-dom";
const Header: React.FC<{}> = () => {


    return (
      <header className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* Company Name */}
        <div className="text-2xl font-bold">
          <span className="cursor-pointer">Plog</span>
        </div>

        {/* Login Button */}
        <div>
        <Link
            to="/login"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Log In
          </Link>
        </div>
      </div>
    </header>
      );
};

export default Header;