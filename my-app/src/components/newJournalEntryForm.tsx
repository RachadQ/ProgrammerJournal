import axios, { AxiosResponse } from 'axios';
import React, { useState, useEffect } from 'react';
import  JournalEntryProp  from '../interface/JournalEntryProp';
import { TagProp } from '../interface/TagProp';

interface NewJournalEntryFormProps {
  addEntry: (newEntry: JournalEntryProp) => void;
}


  const NewJournalEntryForm: React.FC<NewJournalEntryFormProps> = ({ addEntry }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<TagProp[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [query, setQuery] = useState(""); 
    const [tagSuggestions, setTagSuggestions] = useState<TagProp[]>([]);


  

     // Function to get cookie value by name
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  
  useEffect(() => {
    
    const storedToken = getCookie('authToken'); // Get the token from cookies
    if (storedToken) {
      // Set the token in state
      setToken(storedToken);
      
      // Send the token to the backend to get user information
      const fetchUserInfo = async () => {
        
        try {
         
          const response = await fetch('http://localhost:3001/user-info', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`, // Send the token in the Authorization header
            },
          });
          
          
          if (!response.ok) {
            throw new Error('Failed to authenticate');
          }

          const data = await response.json();
        
          const { _id } = data;  // Assuming the userId is in the response body
          
          setUserId(_id);  // Store the userId in the state
        } catch (error) {
          console.error("Error fetching user info:", error);
        }
      };

      fetchUserInfo();  // Call the function to fetch user data from the server
    } else {
      console.error("No authentication token found");
    }
  }, []);
  
    const handleSubmit = async (e: React.FormEvent) => {
     
      e.preventDefault(); // Prevent the default form submission behavior

      
      if (!userId) {
        alert("User ID is required.");
        return;
      }
    
      try {
        
        const tagNames = tags.map(tag => tag.name); // Extract tag names

    
        
    
        // Create the journal entry with resolved tag IDs
        const response = await axios.post(
          'http://localhost:3001/entrie',
          { title, content, tags: tagNames, userId: userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
    
        // Add the new entry to the local state (or any state management you use)
        addEntry({
          _id: response.data._id, // Assuming backend returns the new entry with _id
          title,
          content,
          tags: tags.map((tag) => ({ _id: tag._id, name: tag.name } )), // Ensure tags are correctly formatted
          user: userId as string,
          createdAt: new Date().toISOString(),  // Add createdAt timestamp
          updatedAt: new Date().toISOString(),  // Add updatedAt timestamp
        });
    
        // Reset form fields
        setTitle('');
        setContent('');
        setTags([]);
        setIsOpen(false);
      } catch (error) {
        console.error(error);

         // Handle Axios-specific errors
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with a status outside the 2xx range
      console.error('Response error:', error.response.data);
      alert(`Error ${error.response.status}: ${error.response.data.message || 'An error occurred on the server.'}`);
    } else if (error.request) {
      // Request was made, but no response was received
      console.error('No response received:', error.request);
      alert('No response received from the server. Please check your network connection.');
    } else {
      // Something went wrong in setting up the request
      console.error('Request setup error:', error.message);
      alert(`Request error: ${error.message}`);
    }
  } else {
    // Handle non-Axios errors
    console.error('Unexpected error:', error);
    alert('An unexpected error occurred. Please try again later.');
  }
      }
    };
  
    const handleOpen = () => {
      setIsOpen(true);
    };



    const handleTagChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = e.target.value;
      setQuery(newQuery);

      
    
      // Filter out duplicates from the current tags
      const uniqueTags = newQuery
        .split(",")
        .map((tag) => tag.trim())
        .filter((name) => name && !tags.some((tag) => tag.name.toLowerCase() === name));
    
      // Check if there are new valid tags
      if (uniqueTags.length > 0) {
        try {
          // Fetch tag suggestions from the server (only valid tags from the database)
          const response = await axios.get(`http://localhost:3001/tags/search?query=${newQuery}`);
          setTagSuggestions(response.data); // Update suggestions from the backend
        } catch (error) {
          console.error("Error fetching tag suggestions:", error);
        }
      } else {
        setTagSuggestions([]); // Clear suggestions if no new valid tags
      }
    };
    

  const handleAddTag = (tag: TagProp) => {
    // Add the selected tag from the suggestion list if not already added
    if (!tags.some((existingTag) => existingTag.name.toLowerCase() === tag.name.toLowerCase())) {
      setTags((prevTags) => [...prevTags, tag]);
    }
    setQuery(''); // Clear the query input
  setTagSuggestions([]); // Clear the suggestions
  };

  const handleRemoveTag = (tagId: string) => {
    setTags((prevTags) => prevTags.filter((tag) => tag._id !== tagId));

  };

  
  return (
    <div className="relative flex justify-center items-center min-h-[10vh] bg-gray-100">
      <button
        className="flex items-center bg-white text-gray-500 font-medium py-2 px-4 rounded-full shadow hover:bg-gray-100 transition duration-300 ease-in-out"
        onClick={() => setIsOpen(true)}
      >
        <span className="text-left">Start a post</span>
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center">Create a Post</h2>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              {/* Title Input */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold">Title:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Content Input */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold">Content:</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Tags Input */}
              <div className="flex flex-col space-y-2 relative">
                <label className="text-sm font-semibold">Tags (comma-separated):</label>
                <input
                  type="text"
                  value={query}
                  onChange={handleTagChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />

                {/* Selected Tags */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag._id}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag.name}
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveTag(tag._id)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Floating Tag Suggestions Dropdown */}
                {tagSuggestions.length > 0 && (
                  <ul className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {tagSuggestions.map((tag) => (
                      <li
                        key={tag._id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleAddTag(tag)}
                      >
                        {tag.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Submit and Cancel Buttons */}
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg mt-4 hover:bg-blue-600 transition"
              >
                Add Entry
              </button>
              <button
                type="button"
                className="w-full bg-gray-500 text-white py-2 rounded-lg mt-4 hover:bg-gray-600 transition"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
  };
  
  export default NewJournalEntryForm;


