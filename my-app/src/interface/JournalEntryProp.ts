import { TagProp } from './TagProp';






export default interface JournalEntryProp {
    id: number;
    title: string;
    content: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    tags: { info: TagProp }[];
    

  }
  