import React, { useEffect } from 'react';
import JournalEntry from './journalEntry';
import '../styles/entry.css'
import JournalEntryListProps from '../interface/JournalEntryListProps';


    const JournalEntryList: React.FC<JournalEntryListProps> = ({entries,isOwner, ownerName,onDelete,onEdit}) =>{
   
      
      return (
        <section>
        <h2 className="text-2xl font-semibold text-center my-6">Journal Entries</h2>
        {entries.length === 0 ? (
          <p className="text-center text-gray-500">No entries available.</p>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              
              <JournalEntry
                key={entry._id}
                entry={entry}
                userId={entry.user || ""}
                ownerName={ownerName || ""}
                isOwner={isOwner}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        )}
      </section>
    );
    }

    export default JournalEntryList;