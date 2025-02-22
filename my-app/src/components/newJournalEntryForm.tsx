import axios, { AxiosResponse } from 'axios';
import React, { useState, useEffect } from 'react';
import  JournalEntryProp  from '../interface/JournalEntryProp';
import { TagProp } from '../interface/TagProp';
import Cookies from 'js-cookie';
interface NewJournalEntryFormProps {
  addEntry: (newEntry: JournalEntryProp) => void;
  IsOwner: boolean;
}


  const NewJournalEntryForm: React.FC<NewJournalEntryFormProps> = ({ addEntry,IsOwner }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<TagProp[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [query, setQuery] = useState(""); 
    const [tagSuggestions, setTagSuggestions] = useState<TagProp[]>([]);
    const [name, SetName] = useState<string | null>(null);

  
  useEffect(() => {
    // Function to fetch user information
    const fetchUserInfo = async () => {
      try {
        let storedToken = Cookies.get('authToken'); // Get the token from cookies
        const refreshToken = Cookies.get('refreshToken');
        console.log(refreshToken);
        // Refresh the token if it doesn't exist or has expired
        if (!storedToken && refreshToken) {
          console.log(storedToken);
          const tokenResponse = await axios.post('http://localhost:3001/refresh-token', { refreshToken });
         
          storedToken = tokenResponse.data.accessToken;
          
       
        }
  
        if (storedToken) {
          // Set the token in state
          setToken(storedToken);
  
          // Fetch user information
          const response = await axios.get('http://localhost:3001/user-info', {
            headers: {
              Authorization: `Bearer ${storedToken}`, // Include token in Authorization header
            },
          });
  
          if (response.status === 200) {
            const { _id } = response.data; // Assuming `_id` is the userId field in the response
            console.log("this is the data" + response.data.name)
            SetName(response.data.name);
            setUserId(_id); // Store userId in state
          } else {
            throw new Error('Failed to fetch user information');
          }
        } else {
          console.error('No authentication token found');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
  
    // Call the function
    fetchUserInfo();
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
          owerName: name ,
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
    <>
    {IsOwner && (
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
    )}
  </>)
  };
  
  export default NewJournalEntryForm;


