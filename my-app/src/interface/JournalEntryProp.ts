import { TagProp } from './TagProp';






export default interface JournalEntryProp {
    _id: number;
    title: string;
    content: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    tags: TagProp[];
    

  }
  