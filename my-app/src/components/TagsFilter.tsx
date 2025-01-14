
  import React, { useState, useEffect } from "react";
 
  import TagsFilterProps from "../interface/TagFIlterProps";


  const TagsFilter: React.FC<TagsFilterProps> = ({ entries, onFilterChange,authenticatedUserId }) => {
      const [uniqueTags, setUniqueTags] = useState<string[]>([]);
      const [activeTag, setActiveTag] = useState<string>("All");
    
      useEffect(() => {
        // Filter entries for the authenticated user
        const userEntries = entries.filter((entry) => entry.user === authenticatedUserId);
    
        // Generate unique tags from the user's journal entries
        const tagsSet = new Set<string>();
        userEntries.forEach((entry) => {
          entry.tags.forEach((tag) => tagsSet.add(tag.name)); // Assuming `tag.name` is the tag's identifier
        });
    
        setUniqueTags(["All", ...Array.from(tagsSet)]);
        onFilterChange(userEntries);
      }, [entries, authenticatedUserId]);

      const handleTagClick = (tag: string) => {
        setActiveTag(tag);
    
        if (tag === "All") {
          // Show all entries for the authenticated user
          onFilterChange(entries.filter((entry) => entry.user === authenticatedUserId));
        } else {
          // Show entries matching the selected tag for the authenticated user
          onFilterChange(
            entries.filter(
              (entry) =>
                entry.user === authenticatedUserId &&
                entry.tags.some((entryTag) => entryTag.name === tag)
            )
          );
        }
      };
  
      return (
        <div className="tags-filter flex justify-center items-center w-full">
          <div className="flex flex-wrap gap-2 justify-center">
            {uniqueTags.map((tag) => (
              <button
                key={tag}
                className={`px-4 py-2 rounded-full text-sm font-medium border 
                  ${
                    activeTag === tag
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