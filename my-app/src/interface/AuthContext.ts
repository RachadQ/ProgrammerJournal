

export interface AuthContextType {
    authToken: string | null;
    username: string | null;
    authRefreshToken: string | null;
    setAuthToken: React.Dispatch<React.SetStateAction<string | null>>;
    setAuthRefreshToken: React.Dispatch<React.SetStateAction<string | null>>;
    loginUserUserId: string | null;
    setLoginUserId: React.Dispatch<React.SetStateAction<string | null>>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    error: string | null;
  }