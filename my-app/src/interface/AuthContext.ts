

export interface AuthContextType {
    token: string | null;
    setToken: React.Dispatch<React.SetStateAction<string | null>>
  }
  