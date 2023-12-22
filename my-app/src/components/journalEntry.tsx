import React, {useState} from 'react'
import axios from 'axios';
import '../styles/entry.css'
interface JournalEntryProps{
   entry:{
    id: number;
    title: string;
    content: string;
    tags: string[]; 
   }
}

const JournalEntry: React.FC<JournalEntryProps> = ({entry}) =>{

    //split each tag by comma
    const tagsString = entry.tags.join(', ');
    return (
        <div className="journal-post">
      <h3>{entry.title}</h3>
      <p>{entry.content}</p>
      <p className="tags"> {tagsString}</p>
    </div>
      );
}

export default JournalEntry;
