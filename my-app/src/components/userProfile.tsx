import React,{useEffect,useState} from "react";
import axios from 'axios'
import JournalEntryList  from "./journalEntryList";
import NewJournalEntryForm from "./newJournalEntryForm";
import { profile } from "console";
import JournalEntry from './journalEntry';
import '../styles/profile.css'
interface userProfile{
    profile: {
    name: string;
    title: string;
    id: number;
};
}

const UserProfile: React.FC<userProfile> = ({profile}) => {
    const [journalEntries, setJournalEntries] = useState([
        {
          id: 1,
          title: 'First Entry',
          content: 'This is my first journal entry. Excited to start!',
          tags: ['c++', 'c#'],
        },
        {
          id: 2,
          title: 'Learning React',
          content: 'Enjoying the React learning process. It’s amazing!',
          tags: ['c++', 'c#'],
        },
        // Add more journal entries as needed
      ]);
    

      const addEntry = (newEntry: any) => {
        const updatedEntries = [...journalEntries, newEntry];
    setJournalEntries(updatedEntries);
      };

      
    return (
       
        <div className="profile-container">
        {/*profile */ }
        {
          profile && (
            <div className="profile">
              <div className="profile-header">
              <img
              src="https://randomuser.me/api/portraits/men/75.jpg"
              alt="Profile image"
              className="profile-header-image"
            />
             <div className="profile-header-info">
                <h2>{profile.name}</h2>
                <p>{profile.title}</p>

            </div>
              </div>
            </div>
          )
        }
         {/* Journal Entries*/ }
         
         <div className="journal-entries">
        {/* Pass addEntry function as a prop to NewJournalEntryForm */}
        <NewJournalEntryForm addEntry={addEntry} />

        {/* Render JournalEntryList passing journalEntries */}
        <JournalEntryList entries={journalEntries} />
        </div>
        </div>

      );

}

export default UserProfile;