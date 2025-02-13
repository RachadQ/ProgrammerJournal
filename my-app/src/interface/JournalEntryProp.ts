import { TagProp } from './TagProp';


export default interface JournalEntryProp {
    _id: string;
    title: string;
    content: string;
    user: string;
    owerName: string | null;
    createdAt: string;
    updatedAt: string;
    tags: TagProp[];


  }
  