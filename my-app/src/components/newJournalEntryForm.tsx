import axios from 'axios';
import React, { useState, useEffect } from 'react';

interface NewJournalEntryFormProps {
  addEntry: (newEntry: JournalEntry) => void;
}

interface JournalEntry {
    id: number;
    title: string;
    content: string;
    tags: string[];
  }

  const NewJournalEntryForm: React.FC<NewJournalEntryFormProps> = ({ addEntry }) => {
    const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setToken(token);
  }, []);

  useEffect(() => {
    const handleSubmit = async () => {
      try {
        const response = await axios.post('http://localhost:3001/entries', {
          title,
          content,
          tags,
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        addEntry({
          id: Math.floor(Math.random() * 1000),
          title,
          content,
          tags,
        });

        setTitle('');
        setContent('');
        setTags('');
        setIsOpen(false);
      } catch (error) {
        console.error(error);
      }
    };

    return () => {
      // Cleanup function (optional)
    };
  }, [title, content, tags, token]);

  const handleOpen = () => {
    setIsOpen(true);
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
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
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

  export {};