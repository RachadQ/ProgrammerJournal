import React from 'react';
import JournalEntry from './journalEntry';
import '../styles/entry.css'
interface JournalEntryListProps{
    entries:{
        id: number;
        title: string;
        content: string;
        tags: string[]; 
    }[];


}

    const JournalEntryList: React.FC<JournalEntryListProps> = ({entries}) =>{
        return (
            <div className="journal-entries">
              <h2>Journal Entries</h2>
              <ul>
                {entries.map(entry => (
                   <div key={entry.id} className="journal-entry">
                   <JournalEntry entry={entry} />
                 </div>
                ))}
              </ul>
            </div>
          );
    }

    export default JournalEntryList;