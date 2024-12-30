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

  

     // Function to get cookie value by name
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

    useEffect(() => {
      const storedToken = getCookie('authToken'); // Assuming `authToken` is stored in a cookie
      if (storedToken) {
        setToken(storedToken);
      }

      // Get userId from cookies
      const storedUserId = getCookie('userId'); // Assuming userId is stored in a cookie
     setUserId(storedUserId);
    }, []);
    

  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault(); // Prevent the default form submission behavior
      if (!userId) {
        alert("User ID is required.");
        return;
      }
      try {
        const tagNames = tags.map((tag) => tag.name).join(',').split(',').map(tag => tag.trim());
    const tagIds: string[] = []; // Explicitly type as an array of strings

    for (const tagName of tagNames) {
          const response: AxiosResponse<{ _id: string }> = await axios.post(
            'http://localhost:3001/tags',
            { name: tagName }
          );

          if (response.data) {
            tagIds.push(response.data._id); // TypeScript knows tagIds should hold strings
          }
        }

        const response = await axios.post(
          'http://localhost:3001/entries',
          { title,
             content,
              tags: tagIds ,
              userId: userId
            },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
  
        addEntry({
          id: response.data._id, // Assuming the response returns the new entry with _id
          title,
          content,
          tags: tags.map((tag) => ({ info: { id: tag.id, name: tag.name } })),  // Ensure tags conform to TagProp
          userId: userId as string,
          createdAt: new Date().toISOString(),  // Add createdAt
          updatedAt: new Date().toISOString()   // Add updatedAt
        });
  
  
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

    const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const tagNames = e.target.value.split(',').map((tag) => tag.trim());
    const tagObjects = tagNames.map((name, index) => ({
      id: `temp-${index}`, // Generate a temporary ID for each tag
      name,
    }));
    setTags(tagObjects);
    };
  
    return (
      <div className="relative flex justify-center items-center min-h-[10vh] bg-gray-100">
        <button
          className="flex items-center bg-white text-gray-500 font-medium py-2 px-4 rounded-full shadow hover:bg-gray-100 transition duration-300 ease-in-out"
          onClick={handleOpen}
        >
          <span className="text-left">Start a post</span>
        </button>
        {isOpen && (
          <div className="fixed inset-0 bg-gray-700 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-center">Create a Post</h2>
              <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-semibold">Title:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-semibold">Content:</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-semibold">Tags (comma-separated):</label>
                  <input
                    type="text"
                    value={tags.map(tag => tag.name).join(', ')}
                    onChange={handleTagChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
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
  export{};