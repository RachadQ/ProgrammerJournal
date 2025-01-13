
import React, { useState, useEffect } from "react";
import "../styles/tags.css";
import TagsFilterProps from "../interface/TagFIlterProps";


const TagsFilter: React.FC<TagsFilterProps> = ({ entries, onFilterChange }) => {
    
    
    const [uniqueTags, setUniqueTags] = useState<string[]>([]);
    const [activeTag, setActiveTag] = useState<string>("All");
  
    useEffect(() => {
      // Generate unique tags from journal entries
      const tagsSet = new Set<string>();
      entries.forEach((entry) => {
        entry.tags.forEach((tag) => tagsSet.add(tag));
      });
      setUniqueTags(["All", ...Array.from(tagsSet)]);
    }, [entries]);
  
    const handleTagClick = (tag: string) => {
      setActiveTag(tag);
      if (tag === "All") {
        onFilterChange(entries);
      } else {
        onFilterChange(entries.filter((entry) => entry.tags.includes(tag)));
      }
    };
  
    return (
      <div className="tags-filter">
        {uniqueTags.map((tag) => (
          <button
            key={tag}
            className={`tag ${activeTag === tag ? "active" : ""}`}
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    );
  };
  
  export default TagsFilter;