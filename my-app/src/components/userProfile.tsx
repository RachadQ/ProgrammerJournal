import React, { useEffect, useState,useRef  } from "react";
import axios from 'axios';
import JournalEntryList from "./journalEntryList";
import NewJournalEntryForm from "./newJournalEntryForm";
import { useParams } from 'react-router-dom';
import { ProfileWithEntriesResponse } from '../types';
import JournalEntryProp from "../interface/JournalEntryProp";
import Cookies from 'js-cookie';  // Import the js-cookie library
import '../styles/profile.css';
import TagsList from "./TagsList";
import TagsFilter from "./TagsFilter";
import UserJournalSection from "./UserJournalSection";



const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileWithEntriesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<JournalEntryProp[]>([]);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);
  const [hasMoreEntries, setHasMoreEntries] = useState(true);
  const [page, setPage] = useState(1);
  const [tags, setTags] = useState<string[]>([]);

  
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(null);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntryProp[]>(entries);
  


  
       // Function to get cookie value by name
       const getCookie = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
      };

  useEffect(() => {
    const fetchProfile = async (page: number) => {
      setLoading(true);
      try {
        const token = Cookies.get('authToken');
        const refreshToken = Cookies.get('refreshToken');
        
        if (!token && refreshToken) {
          const tokenResponse = await axios.post('http://localhost:3001/refresh-token', { refreshToken });
          const newToken = tokenResponse.data.token;
       
          Cookies.set('authToken', newToken);
        }
      
        // Fetch user information
        const userInfoResponse = await axios.get('http://localhost:3001/user-info', {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in Authorization header
          },
        });
        const { _id } = userInfoResponse.data;
        setAuthenticatedUserId(_id);
        const response = await axios.get<ProfileWithEntriesResponse>(`http://localhost:3001/user/${username}`, {
          headers: { Authorization: `Bearer ${Cookies.get('authToken')}` },
          params: { page, limit: 5 },
          withCredentials: true,
        });
       
       
      

        setProfile(response.data);
       
         // Filter out any duplicate entries based on the _id
    setEntries(prevEntries => {
      const existingEntryIds = prevEntries.map(entry => entry._id);
      const newEntries = response.data.journalEntries.filter(entry => !existingEntryIds.includes(entry._id));
  return [...prevEntries, ...newEntries];
    });
   
   
      
        // Check if more entries are available
        // Check if there are more entries
if (response.data.journalEntries.length === 0 || entries.length + response.data.journalEntries.length >= response.data.totalEntries) {
  setHasMoreEntries(false);
} else {
  setHasMoreEntries(true);
}

      } catch (err: any) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchAllTags = async () => {
      try{
        const authToken = Cookies.get('authToken'); // Fetch token from cookies
        console.log(" the auth token is" + authToken);
        if(!authToken){
          console.error('no auth token found. fetching tags aborted')
          return;
        }
        const tagResponse = await axios.get('http://localhost:3001/get/tags',
        {
          headers: {
            Authorization: `Bearer ${authToken}`, // Attach token
          }
        });
        console.log(tagResponse.data);
        setTags(tagResponse.data);
        console.log(tagResponse.data);
      }catch(err)
      {
        console.error('Error fetching tags:', err);
      }
    }

    if (username && hasMoreEntries && !loading) {
      console.log("Fetching data for page:", page);
      fetchProfile(page);
    }

    fetchAllTags();
  }, [username, page,hasMoreEntries]);

  useEffect(() => {
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log("Loader is in view, loading next page.");
        if (entry.isIntersecting && hasMoreEntries && !loading) {
        
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1 }
    );
    const loader = loaderRef.current;
    
    if (loader) {
      observer.observe(loader);
    }
  
    return () => {
      if (loader) {
        observer.unobserve(loader);
      }
    };
  }, [hasMoreEntries, loading]);

  

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  const handleAddEntry = (newEntry: JournalEntryProp) => {
    setEntries((prevEntries) => [...prevEntries, newEntry]);
  };

  const deleteEntry = (entryId: string) => {
    setEntries((prevEntries) => prevEntries.filter((entry) => entry._id !== entryId));
  };

  const editEntry = (entry: JournalEntryProp) => {
    setEntries((prevEntries) =>
     
      prevEntries.map((e) => (e._id === entry._id ? entry : e
        
      ))
    );
  };

 
  const downloadResume = async () => {
   // const googleDriveLink = "https://drive.google.com/uc?export=download&id=1UsBGAJXyWdA9WQxzJeGj85fsSDKZFEVI";
  //window.location.href = googleDriveLink;
  };

  if (!profile) {
    return <div className="p-6">Loading profile...</div>;
  }
 

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-4">
  {/* User Profile Section */}
  <section className="py-6 md:py-2 bg-white rounded-lg shadow-md mb-3">
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

  {/* Journal Entries Section */}
  <section className="py-6 md:py-4 mb-3">
    <UserJournalSection
      entries={entries}
      filteredEntries={filteredEntries}
      setFilteredEntries={setFilteredEntries}
      handleAddEntry={handleAddEntry}
      authenticatedUserId={authenticatedUserId || ''}
      deleteEntry={deleteEntry}
      editEntry={editEntry}
      profileUserId={profile.id}
      allTags={tags}

    />
  </section>
  {/* Loader Element */}

  <div ref={loaderRef} className="loader"  style={{ height: '50px' }}>
        {loading ? <p>Loading...</p> : <p>No more entries</p>}
      </div>
</div>

    
  );
};

export default UserProfile;