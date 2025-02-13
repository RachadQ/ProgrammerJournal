import React from "react";
import TagsFilter from "./TagsFilter";
import NewJournalEntryForm from "./newJournalEntryForm";
import JournalEntryList from "./journalEntryList";
import JournalEntryProp from "../interface/JournalEntryProp";


interface UserJournalSectionProps {
  entries: JournalEntryProp[];
  filteredEntries: JournalEntryProp[];
  setFilteredEntries: (entries: JournalEntryProp[]) => void;
  handleAddEntry: (newEntry: JournalEntryProp) => void;
  authenticatedUserId: string; // New prop for user ID
  deleteEntry: (entryId: string) => void;
  userName: string;
  editEntry: (updatedEntry: JournalEntryProp) => void;
  profileUserId: string;
  allTags: string[];
}

const UserJournalSection: React.FC<UserJournalSectionProps> = ({
  entries,
  filteredEntries,
  setFilteredEntries,
  handleAddEntry,
  authenticatedUserId,
  deleteEntry,
  editEntry,
  userName,
  profileUserId,
  allTags,
}) => {

  const isOwner = authenticatedUserId === profileUserId;
  console.log(" The Name" + userName);
  return (
    <div className="user-journal-section bg-gray-100 p-4 rounded-lg shadow-md">
      {/* Tags Section */}
      <section className="tags-section">
        <h2 className="text-xl font-semibold mb-3 ">See Journal Entries with:</h2>
        <TagsFilter entries={entries} onFilterChange={setFilteredEntries} ProfileUser={profileUserId} allTags={allTags} />
      </section>

      {/* Journal Entries Section */}
      <section className="journal-section">
        
        <NewJournalEntryForm addEntry={handleAddEntry} IsOwner={isOwner} />
        {filteredEntries.length > 0 ? (
          <div className="space-y-4 mt-4">
            <JournalEntryList
              entries={filteredEntries}
              userId={profileUserId} // Pass authenticated user ID
              onDelete={deleteEntry} // Pass delete function
              ownerName={userName}
              onEdit={editEntry} // Pass edit function
              isOwner={isOwner}
            />
          </div>
        ) : (
          <div className="p-6 text-gray-500 text-center mt-4">
            No entries found for the selected tag.
          </div>
        )}
      </section>
    </div>
  );
};

export default UserJournalSection;