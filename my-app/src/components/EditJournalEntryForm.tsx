import React, { useState } from 'react';
import JournalEntryProp from '../interface/JournalEntryProp';
import { TagProp } from '../interface/TagProp';

interface EditJournalEntryFormProps {
  initialValues?: {
    _id?: string;
    title: string;
    content: string;
    tags: TagProp[];
    userId?: string;
    entry?: any;
    createdAt?: string;
    updatedAt?: string;
  };
  onSubmit: (entry: JournalEntryProp) => void;
  onCancel: () => void;
}

const EditJournalEntryForm: React.FC<EditJournalEntryFormProps> = ({ initialValues, onSubmit, onCancel }) => {
  const [entry, setEntry] = useState<JournalEntryProp>({
    _id: initialValues?._id || '', // Ensure _id is defined, even if initialValues is not provided
    title: initialValues?.title || '',
    content: initialValues?.content || '',
    tags: initialValues?.tags || [],
    user: initialValues?.userId || '', // Ensure user is defined
    createdAt: initialValues?.createdAt || '', // Set createdAt as needed
    updatedAt: initialValues?.updatedAt || '', // Set updatedAt as needed
  });

  const handleChange = (field: string, value: string | string[]) => {
    setEntry({
      ...entry,
      [field]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(entry);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-semibold text-center mb-4">
        {initialValues ? 'Edit Journal Entry' : 'Create New Journal Entry'}
      </h2>
      <input
        type="text"
        value={entry.title}
        onChange={(e) => handleChange('title', e.target.value)}
        placeholder="Title"
        className="text-2xl font-semibold w-full mb-4"
      />
      <textarea
        value={entry.content}
        onChange={(e) => handleChange('content', e.target.value)}
        placeholder="Content"
        className="mt-4 text-lg text-gray-700 w-full p-2 border rounded"
      />
      <input
        type="text"
        value={entry.tags.join(', ')}
        onChange={(e) => handleChange('tags', e.target.value.split(', '))}
        placeholder="Tags (comma-separated)"
        className="mt-2 p-2 w-full border rounded"
      />
      <div className="mt-4 flex justify-center space-x-4">
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditJournalEntryForm;