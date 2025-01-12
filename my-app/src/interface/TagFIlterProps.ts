
import JournalEntryProp from "./JournalEntryProp";

export default interface TagsFilterProps {
    entries: JournalEntryProp[];
    onFilterChange: (filteredEntries: JournalEntryProp[]) => void;
  };
  