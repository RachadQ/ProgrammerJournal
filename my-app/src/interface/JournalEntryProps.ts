import { TagProp } from './TagProp';
import JournalEntryProp from './JournalEntryProp';

export default interface JournalEntryProps {
    entry: JournalEntryProp;
    userId: string;
    isOwner: boolean;
    ownerName: string;
    onDelete: (entryId: string) => void;
    onEdit: (entry: JournalEntryProp) => void;
  }
  