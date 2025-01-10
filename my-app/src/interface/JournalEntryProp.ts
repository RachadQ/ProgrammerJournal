import { TagProp } from './TagProp';


export default interface JournalEntryProp {
    _id: string;
    title: string;
    content: string;
    user: string;
    createdAt: string;
    updatedAt: string;
    tags: TagProp[];
    

  }
  