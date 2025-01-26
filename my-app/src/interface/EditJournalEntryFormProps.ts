import JournalEntryProp from "./JournalEntryProp";
import { TagProp } from "./TagProp";

export {};
export interface EditJournalEntryFormProps {
    initialValues?: {
      _id: string;
      title: string;
      content: string;
      tags: TagProp[];
      user?: string;
      entry?: any;
      createdAt?: string;
      updatedAt?: string;
    };
    onSubmit: (entry: JournalEntryProp) => void;
    onCancel: () => void;
  }
  