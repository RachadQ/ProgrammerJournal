import React, {useState} from 'react'
import axios from 'axios';
import '../styles/entry.css'
import JournalEntryProp from '../interface/JournalEntryProp';
import JournalEntryProps from '../interface/JournalEntryProps';

import EditJournalEntryForm from './EditJournalEntryForm';

const JournalEntry: React.FC<JournalEntryProps> = ({entry,userId,onDelete,onEdit}) =>{
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  console.log("entry.userId:", entry._id);
  console.log("userId:", userId);
  console.log("entry:", entry);
  const isOwner = entry.user === userId;
  
  const handleDeleteEntry = async (entryId: string) => {

    // Ask the user for confirmation before deleting
    const confirmDelete = window.confirm('Are you sure you want to delete this entry?');

    if (confirmDelete ) {
     try {
       // Make the API call to delete the journal entry
       const response = await axios.delete(`http://localhost:3001/delete/${entryId}`);
       console.log(response.data.message); // You can log the success message

       // Call the onDelete function passed via props to update the state
       onDelete(entryId); // Update state in the parent component
     } catch (error) {
       console.error('Error deleting the entry:', error);
       alert('Failed to delete the entry.');
     }
 }
}
const handleEditEntry = async (updatedEntry: typeof entry) => {
  try {
    const response = await axios.put(`http://localhost:3001/edit/${updatedEntry._id}`, updatedEntry);
    console.log('Edited entry:', response.data);
    onEdit(response.data); // Update the state in the parent component
    setIsEditing(false); // Close the form
  } catch (error) {
    console.error('Error updating entry:', error);
    alert('Failed to update the entry.');
  }
};



   return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-xl mx-auto">
      {isEditing ? (
        <EditJournalEntryForm
          initialValues={{
            _id: entry._id,
            title: entry.title,
            content: entry.content,
            tags: entry.tags, // Map tags to string array
          }}
          onSubmit={handleEditEntry} // No need to map
          onCancel={() => setIsEditing(false)} // Close editing form when cancel is pressed
        />
      ) : (
        <>
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
                onClick={() => setIsEditing(true)} // Switch to editing mode
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteEntry(entry._id)}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default JournalEntry;
