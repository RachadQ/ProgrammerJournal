import React , { useState, useEffect ,useCallback} from "react";
import HeaderProps from "../../types/Header.interface"
import { Link, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';  // Import the js-cookie library
import { FaChevronDown, FaSearch } from "react-icons/fa"; // Import dropdown icon
import { useAuth } from "./AuthProvider";
import axios from "axios";
import { SearchIcon } from "lucide-react"
import SearchResults from "./SearchResult";


interface HeaderPs {

  onSearch: (query: string) => void
}

const Header: React.FC = () => {
  const { authToken, username, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const navigate = useNavigate();

// Toggle dropdown menu
const toggleDropdown = () => {
  setIsDropdownOpen((prev) => !prev);
};


const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const query = event.target.value;
  setSearchQuery(query);

  if (query.trim() === "") {
    setSearchResults([]); // Clear results if the search is empty
    return;
  }

  try {
    // Send the search request to the backend API
    const response = await axios.get('http://localhost:3001/search', { params: { query } });
    setSearchResults(response.data);  // Set the search results
  } catch (error) {
    console.error("Error fetching search results:", error);
  }
  
};

const handleSearchSubmit = (event: React.FormEvent) => {
  event.preventDefault();
  if (searchQuery.trim() !== "") {
    
    // Perform search action here, e.g., navigate to search results page
    console.log("Searching for:", searchQuery);
  }

};

const handleLogout = () => {
  logout();
  setIsDropdownOpen(false); // Close dropdown
};

  // Handle user selection
  const handleUserSelect = (user) => {
    // Navigate to the user's profile page using their username
    navigate(`/user/${user.username}`);
    setSearchQuery("");
  setSearchResults([]);
  };

return (
  <header className="bg-gray-800 text-white shadow-md">
    <div className="container mx-auto flex justify-between items-center py-4 px-6">
      {/* Company Name */}
      <div className="text-2xl font-bold">
        <span className="cursor-pointer">Plog</span>
      </div>

      {authToken && (
       <SearchResults
       searchQuery={searchQuery}
       searchResults={searchResults}
       handleSearchChange={handleSearchChange}
       handleUserSelect={handleUserSelect}
       handleSearchSubmit={handleSearchSubmit}
     />
      )}

      {/* Login Button or Profile Dropdown */}
      <div className="relative">
        {authToken ? (
          <button
            onClick={toggleDropdown}
            className="flex flex-col items-center gap-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-1 px-4 rounded-lg transition duration-200"
          >
            <img 
              src="data:image/png;base64,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" // Replace with actual profile image URL
              alt="Profile"
              className="w-8 h-8 rounded-full" 
            />
            <div className="flex items-center gap-1">
              <span>Me</span>
              <FaChevronDown className="text-sm" />
            </div>
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Log In
          </Link>
        )}

        {/* Dropdown Menu */}
        {isDropdownOpen && authToken && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-lg">
            <Link
              to={`/user/${username}`}
              className="block px-4 py-2 hover:bg-gray-200"
              onClick={() => setIsDropdownOpen(false)}
            >
              Go to Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-200"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  </header>
);
};

export default Header;