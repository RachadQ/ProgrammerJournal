import React, { useState } from 'react';

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
  
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
  
      // Basic validation
      if (!title || !content) {
        alert('Please fill in both title and content fields.');
        return;
      }
  
      // Split tags by comma and trim spaces
      const tagList = tags.split(',').map(tag => tag.trim());
  
      // Create a new journal entry object
      const newEntry: JournalEntry = {
        id: Math.floor(Math.random() * 1000), // Replace with a better ID generation method
        title,
        content,
        tags: tagList,
      };
  
      // Call the addEntry function to add the new entry
      addEntry(newEntry);
  
      // Reset form fields after submission
      setTitle('');
      setContent('');
      setTags('');
    };
  
    return (
      <div className="new-entry-form">
        <h2>Create a New Journal Entry</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Title:
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label>
            Content:
            <textarea value={content} onChange={(e) => setContent(e.target.value)} />
          </label>
          <label>
            Tags (comma-separated):
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} />
          </label>
          <button type="submit">Add Entry</button>
        </form>
      </div>
    );
  };

  export default NewJournalEntryForm;

  export {};