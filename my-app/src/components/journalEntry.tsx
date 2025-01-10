import React, {useState} from 'react'
import axios from 'axios';
import '../styles/entry.css'
import JournalEntryProp from '../interface/JournalEntryProp';
import JournalEntryProps from '../interface/JournalEntryProps';


const JournalEntry: React.FC<JournalEntryProps> = ({entry,userId,onDelete,onEdit}) =>{
  console.log("entry.userId:", entry._id);
  console.log("userId:", userId);
  console.log("entry:", entry);
  const isOwner = entry.user === userId;

  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-xl mx-auto">
    <h2 className="text-2xl font-semibold text-center">{entry.title}</h2>
    <p className="mt-4 text-lg text-gray-700">{entry.content}</p>
    
    <div className="mt-4">
      <strong className="font-medium">Tags: </strong>
      {entry.tags.length > 0 ? (
        <div className="flex flex-wrap justify-center space-x-2 mt-2">
          {entry.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-block bg-gray-200 text-gray-800 rounded-full px-4 py-2 text-sm"
            >
              {tag.name}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-gray-500">No tags</span>
      )}
    </div>

    {isOwner && (
      <div className="mt-4 flex justify-center space-x-4">
        <button
          onClick={() => onEdit(entry)}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(entry._id)}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    )}
  </div>
);
}

export default JournalEntry;
