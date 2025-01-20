import React from "react";
import JournalEntryProp from "./JournalEntryProp";
export default interface JournalEntryListProps {
    entries: JournalEntryProp[];
    userId: string | undefined;
    onDelete: (entryId: string) => void;
    onEdit: (entry: JournalEntryProp) => void;
    isOwner: boolean;

  }
  