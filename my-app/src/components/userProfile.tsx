import React,{useEffect,useState} from "react";
import axios from 'axios'
import JournalEntryList  from "./journalEntryList";
import NewJournalEntryForm from "./newJournalEntryForm";
import { profile } from "console";
import JournalEntry from './journalEntry';
import { useParams } from 'react-router-dom';
import { ProfileWithEntriesResponse } from '../types';
import '../styles/profile.css'
interface userProfile{
    profile: {
    name: string;
    title: string;
    id: number;
};
}
const TagComponent = ({ info }: { info: { id: string; name: string } }) => (
  <span className="bg-gray-300 text-gray-800 px-4 py-2 rounded-full">{info.name}</span>
);


  // Fake journal entries data
  const fakeEntries = [
    {
      id: "1",
      title: "My First Journal Entry",
      content: "This is the content of my first journal entry. I'm excited to start journaling!",
      createdAt: "2024-12-10T12:30:00.000Z",
      tags: [
        { info: { id: "tag1", name: "Personal" } },
        { info: { id: "tag2", name: "Exciting" } },
      ],
    },
    {
      id: "2",
      title: "A New Beginning",
      content: "Today marks a new chapter in my life. I'm focusing on personal growth and learning.",
      createdAt: "2024-12-11T14:45:00.000Z",
      tags: [
        { info: { id: "tag3", name: "Growth" } },
        { info: { id: "tag4", name: "Motivation" } },
      ],
    },
    {
      id: "3",
      title: "Challenges Ahead",
      content: "I'm starting to face some challenges at work. I'm determined to overcome them.",
      createdAt: "2024-12-12T09:00:00.000Z",
      tags: [
        { info: { id: "tag5", name: "Work" } },
        { info: { id: "tag6", name: "Challenges" } },
      ],
    },
  ];

const UserProfile: React.FC = () => {
    
  const {username} = useParams<{username: string}>();
  const [profile,setProfile] = useState<ProfileWithEntriesResponse | null>(null);
  const [error,setError] =  useState<string | null>();
    

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get<ProfileWithEntriesResponse>(`http://localhost:3001/user/${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProfile(response.data);
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

  if (!profile) {
    return <div className="p-6">Loading...</div>;
  }

  const downloadResume = async () => {
    const googleDriveLink = "https://drive.google.com/uc?export=download&id=1UsBGAJXyWdA9WQxzJeGj85fsSDKZFEVI";
    window.location.href = googleDriveLink;
  };
 
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
                  src={`https://www.bing.com/th?id=OIP.42gCaIWoZnhhRiZ7BzQXjQHaHa&w=174&h=185&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2`} // Replace with real profile picture if needed
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
       {/* Journal Entries */}
       <section>
          <h2 className="text-xl font-semibold mt-4 text-left mx-auto max-w-xl mb-5">Journal Entries:</h2>
          <div className="space-y-4">
            {fakeEntries.map((entry) => (
              <div key={entry.id} className="journal-post bg-white rounded-lg shadow-md p-8 md:p-12 mb-8 mx-auto max-w-xl">
                <div className="entry-title">
                  <h3 className="text-xl md:text-2xl font-semibold text-center">{entry.title}</h3>
                </div>
                <div className="entry-content mt-4 md:mt-6">
                  <p className="text-lg md:text-xl text-gray-700 text-center">{entry.content}</p>
                </div>
                <div className="entry-tags flex flex-wrap mt-4 md:mt-6 justify-center" style={{ columnGap: "20px" }}>
                  {entry.tags.map((tag) => (
                    <div key={tag.info.id} className="mr-2 mb-2">
                      <TagComponent key={tag.info.id} info={tag.info} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    
  );
};

export default UserProfile;