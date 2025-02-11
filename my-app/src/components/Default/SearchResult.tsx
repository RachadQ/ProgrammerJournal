import type React from "react"
import { FaSearch } from "react-icons/fa"
import axios from "axios"

interface SearchResultsProps {
    searchQuery: string
    searchResults: any[] // Search results will be an array, but with any type for now
    handleUserSelect: (user: any) => void
    handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleSearchSubmit: (e: React.FormEvent) => void
  }
  
  const SearchResults: React.FC<SearchResultsProps> = ({
    searchQuery,
    searchResults,
    handleUserSelect,
    handleSearchChange,
    handleSearchSubmit,
  }) => {
    
  
    return (
        <>
        {/* Search form */}
        <form
          onSubmit={handleSearchSubmit}
          className="container mx-auto px-4 py-3 flex items-center justify-center mb-1"
        >
          <div className="relative flex-grow max-w-2xl">
            <input
              type="text"
              placeholder="Search by name or username"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full py-2 pl-10 pr-4 text-gray-700 bg-gray-100 rounded-md focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      
        {/* Search results */}
        {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mx-auto max-w-2xl bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ top: '69px' ,right: "20px"}}>

            {searchResults.map((user: any, index: number) => (
              <div
                key={index} // Using index as the key, you could replace this with a unique identifier if available
                onClick={() => handleUserSelect(user)}
                className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3 group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-white group-hover:border-blue-200 transition-colors duration-200">
                  <span className="text-blue-600 font-semibold text-lg">
                    {user.firstName.charAt(0)}
                  </span>
                </div>
                <div className="flex flex-col flex-grow">
                  <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )
  }
  
  export default SearchResults