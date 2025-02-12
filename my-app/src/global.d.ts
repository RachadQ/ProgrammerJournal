// google-ads.d.ts

declare global {
    interface Window {
      adsbygoogle: {
        loaded: boolean;
        push: (arg: object) => void;
      };
    }
  }
  
  export {}; // This ensures the file is treated as a module and avoids conflicts.
  