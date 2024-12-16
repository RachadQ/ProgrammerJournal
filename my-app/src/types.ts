// Add this line to make sure the file is considered a module
export {};

export interface Entry {
    _id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
  }


  export interface ProfileWithEntriesResponse {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    journalEntries: Entry[];
  }
  