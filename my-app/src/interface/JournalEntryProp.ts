
import { Tagprop } from "./tagProp";

export{};


export interface JournalEntryProp {
    id: number;
    title: string;
    content: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    tags: { info: Tagprop }[];
    

  }
  