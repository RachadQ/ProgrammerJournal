import React, { useEffect, useState } from "react";
import axios from 'axios';
import JournalEntryList from "./journalEntryList";
import NewJournalEntryForm from "./newJournalEntryForm";
import { useParams } from 'react-router-dom';
import { ProfileWithEntriesResponse } from '../types';
import JournalEntryProp from "../interface/JournalEntryProp";
import Cookies from 'js-cookie';  // Import the js-cookie library
import '../styles/profile.css';
import TagsList from "./TagsList";
import { TagProp } from "../interface/TagProp";

interface userProfile {
  profile: {
    name: string;
    title: string;
    id: number;
  };
  entries: JournalEntryProp[];
}

const TagComponent = ({ info }: { info: { id: string; name: string }  }) => (
  <span className="bg-gray-300 text-gray-800 px-4 py-2 rounded-full">{info.name}</span>
);

const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileWithEntriesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<JournalEntryProp[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = Cookies.get('authToken');
        const refreshToken = Cookies.get('refreshToken');
    
        if (!token) {
          if (refreshToken) {
            // Attempt to refresh the token using the refresh token
            const tokenResponse = await axios.post('http://localhost:3001/auth/refresh', {
              refreshToken,
            });
            const newToken = tokenResponse.data.token;
            Cookies.set('authToken', newToken); // Save the new token in the cookies
          } else {
            setError('No valid tokens found');
            return;
          }
        }
    
        const response = await axios.get<ProfileWithEntriesResponse>(`http://localhost:3001/user/${username}`, {
          headers: {
            Authorization: `Bearer ${Cookies.get('authToken')}`,
          },
          withCredentials: true,
        });
        console.log(response);
        setProfile(response.data);
        if (response.data.journalEntries) {
          setEntries(response.data.journalEntries); 
        } else {
          console.error('Error: Entries not found or invalid'); // Log the error to the console
          setEntries([]); // Set entries to an empty array if invalid
          setError('Entries are missing or invalid.'); // Optionally set an error state
        }
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load profile.');
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  const handleAddEntry = (newEntry: JournalEntryProp) => {
    setEntries((prevEntries) => [...prevEntries, newEntry]);
  };

  const downloadResume = async () => {
    const googleDriveLink = "https://drive.google.com/uc?export=download&id=1UsBGAJXyWdA9WQxzJeGj85fsSDKZFEVI";
    window.location.href = googleDriveLink;
  };

  if (!profile) {
    return <div className="p-6">Loading profile...</div>;
  }
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-4">
      <section className="py-6 md:py-2">
        <div className="container max-w-screen-xl mx-auto px-4">
          <nav className="flex items-center justify-between mb-8 md:mb-16">
            <div className="px-5 py-2 md:px-7 md:py-3 bg-white font-medium md:font-semibold text-gray-700 text-sm md:text-md rounded-md hover:bg-gray-700 hover:text-white transition ease-linear duration-500">
              <button id="downloadBtn" onClick={downloadResume} value="download">
                Get my CV
              </button>
            </div>
          </nav>
          <div className="text-center">
            <div className="flex justify-center mb-2 md:mb-2">
              <img
                src={`https://www.bing.com/th?id=OIP.42gCaIWoZnhhRiZ7BzQXjQHaHa&w=174&h=185&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2`} 
                alt="Profile Picture"
                className="w-32 h-32 md:w-48 md:h-48 rounded-full"
              />
            </div>
            <h6 className="font-medium text-gray-600 text-lg md:text-2xl uppercase mb-0 md:mb-0">
              {profile.firstName} {profile.lastName}
            </h6>
          </div>
        </div>
      </section>
  
      {/* Journal Entries */}
      <section>
        <h2 className="text-xl font-semibold mt-4 text-left mx-auto max-w-xl mb-5">Journal Entries:</h2>
        <NewJournalEntryForm addEntry={handleAddEntry} />
        {entries && entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="journal-post bg-white rounded-lg shadow-md p-8 md:p-12 mb-8 mx-auto max-w-xl">
                <div className="entry-title">
                  <h3 className="text-xl md:text-2xl font-semibold text-center">{entry.title}</h3>
                </div>
                <div className="entry-content mt-4 md:mt-6">
                  <p className="text-lg md:text-xl text-gray-700 text-center">{entry.content}</p>
                </div>
                <div className="entry-tags flex flex-wrap mt-4 md:mt-6 justify-center" style={{ columnGap: "20px" }}>
                  {entry.tags?.map(({ info }: { info: TagProp }) => (
                    <div key={info._id} className="mr-2 mb-2">
                      <TagsList tags={[info]} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="p-6 text-gray-500 text-center">No entries yet. Start by adding a new journal entry!</div>
            {console.error("Error: Entries are empty or undefined:", entries)} {/* This will log an error */}
          </>
        )}
      </section>
    </div>
  );
};

export default UserProfile;