
  import React, { useState, useEffect,useCallback,useRef } from "react";
 
  import TagsFilterProps from "../interface/TagFIlterProps";
import axios from "axios";


  const TagsFilter: React.FC<TagsFilterProps> = ({ entries, onFilterChange,ProfileUser,allTags }) => {
    const [activeTag, setActiveTag] = useState<string>("All");
    const initialized = useRef(false); // Prevents multiple initial calls
  
    // Function to filter entries based on tag selection
    const handleFilterChange = useCallback(
      (tag: string) => {
        if (tag === "All") {
          // When "All" is selected, show all entries for the user
          onFilterChange(entries.filter((entry) => entry.user === ProfileUser));
        } else {
          // Filter entries by the selected tag
          onFilterChange(
            entries.filter(
              (entry) =>
                entry.user === ProfileUser && entry.tags.some((entryTag) => entryTag.name === tag)
            )
          );
        }
      },
      [entries, ProfileUser, onFilterChange,activeTag]
    );
  
    useEffect(() => {
      if (initialized.current) return; // Prevent duplicate execution
      initialized.current = true;
  
      // Filter entries for the authenticated user
      const userEntries = entries.filter((entry) => entry.user === ProfileUser);
  
      // Generate unique tags from the user's journal entries
      const tagsSet = new Set<string>();
      userEntries.forEach((entry) => {
        entry.tags.forEach((tag) => tagsSet.add(tag.name)); // Assuming `tag.name` is the tag's identifier
      });
  
      // Update allTags with the "All" option at the start
      const updatedTags = ["All", ...Array.from(tagsSet)];
  
      // Pass the updated tags to the parent via the onFilterChange
     // onFilterChange(entries); // Make sure to update the filtered entries based on initial state
  
      // Call filter change with "All" tag selected initially
      handleFilterChange("All");
    }, [entries, ProfileUser, onFilterChange, handleFilterChange]);
  
    // Handle tag click
    const handleTagClick = useCallback(
      (tag: string) => {
        setActiveTag(tag);
        handleFilterChange(tag);
      },
      [handleFilterChange,setActiveTag]
    );
  


      return (
        
        <div className="tags-filter flex justify-center items-center w-full">
        <div className="flex flex-wrap gap-2 justify-center">
          {/* Add "All" tag to the button list */}
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium border 
              ${activeTag === "All"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-gray-200 text-gray-700 border-gray-300"
              } hover:bg-blue-500 hover:text-white transition`}
            onClick={() => handleTagClick("All")}
          >
            All
          </button>
          
          {/* Add dynamic tags */}
          {allTags?.map((tag) => (
            <button
              key={tag}
              className={`px-4 py-2 rounded-full text-sm font-medium border 
                ${activeTag === tag
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-gray-200 text-gray-700 border-gray-300"
              } hover:bg-blue-500 hover:text-white transition`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      );
  };
  
  export default TagsFilter;