import React, { useEffect, useState,useRef,useCallback, useContext  } from "react";
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { ProfileWithEntriesResponse } from '../types';
import JournalEntryProp from "../interface/JournalEntryProp";
import Cookies from 'js-cookie';  // Import the js-cookie library
import '../styles/profile.css';
import UserJournalSection from "./UserJournalSection";
import { useAuth } from "../components/Default/AuthProvider";
import GoogleAd from "./GoogleAd";
import FileUpload from "./FileUpload";

const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileWithEntriesResponse | null>(null);
  
  const { authToken,login, username: loggedInUsername ,loginUserUserId,error } = useAuth();
 
  const [entries, setEntries] = useState<JournalEntryProp[]>([]);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);
  const [hasMoreEntries, setHasMoreEntries] = useState(true);
  const [page, setPage] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntryProp[]>(entries);
  

  /** Fetch Profile & Entries */
  const fetchProfile = useCallback(async () => {
    if (!username || loading || !hasMoreEntries) return;
    
    setLoading(true);
    try {
      

      // Fetch Profile and Journal Entries
      const response = await axios.get<ProfileWithEntriesResponse>(
        `http://localhost:3001/user/${username}`,
        {  params: { page, limit: 5 } }
      );

      setProfile(response.data);
      
      // Append new unique entries
      setEntries((prevEntries) => {
        const newEntries = response.data.journalEntries.filter(
          (entry) => !prevEntries.some((e) => e._id === entry._id)
        );
        return [...prevEntries, ...newEntries];
      });

      // Check if there are more entries
      if (response.data.journalEntries.length === 0 || entries.length + response.data.journalEntries.length >= response.data.totalEntries) {
        setHasMoreEntries(false);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      //error("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [username]);

  /** Fetch Tags */
  const fetchAllTags = useCallback(async () => {
    try {
      
      const tagResponse = await axios.get(`http://localhost:3001/get/${username}/tags`);
      
      setTags(tagResponse.data.map((tag: { name: string }) => tag.name));
      console.log(JSON.stringify(tagResponse));
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  }, [username]);

    /** Fetch Profile & Tags on Mount or Page Change */
    useEffect(() => {
      fetchProfile();
      fetchAllTags();
    }, [fetchProfile, fetchAllTags]);
    //only on mount:  }, [fetchProfile, fetchAllTags]);
    

  
   
    
    
    
    

    
  /** Infinite Scroll Observer */
  useEffect(() => {

    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMoreEntries && !loading) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMoreEntries, loading]);

  useEffect(() => {
    if (!entries || !tags) return;
    console.log("Entries to filter:", entries);
    console.log("Tags:", tags);
  
    // Only apply filtering when entries and tags are available
    if (entries.length > 0) {
      if (tags.length > 0) {
        setFilteredEntries(
          entries.filter((entry) =>
            tags.some((tag) =>
              entry.tags.some((entryTag) => entryTag.name === tag) // If entry.tags is an array of TagProp with name field
            )
          )
        );
      } else {
        setFilteredEntries(entries); // If no tags selected, show all entries
      }
    }
  }, [entries,tags ]); 
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!profile) return <div className="p-6">Loading profile...</div>;

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
     {/* File Upload Section */}
  <section className="py-4">
        <FileUpload userId={profile.id} profilePicture={profile.profilePicture}/> {/* Using FileUpload Component here */}
      </section>

        <h6 className="font-medium text-gray-600 text-lg md:text-2xl uppercase mb-0 md:mb-0">
          {profile.firstName} {profile.lastName}
        </h6>
      </div>
    </div>
  </section>

  {/*Google ad Section*/}
  <section className="py-4">
    <GoogleAd/>
  </section>

  
  {/* Journal Entries Section */}
  <section className="py-6 md:py-4 mb-3">
    <UserJournalSection
      entries={entries}
      filteredEntries={filteredEntries}
      setFilteredEntries={setFilteredEntries}
      handleAddEntry={handleAddEntry}
      authenticatedUserId={loginUserUserId || ''}
      userName={profile.firstName + " "+ profile.lastName}
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