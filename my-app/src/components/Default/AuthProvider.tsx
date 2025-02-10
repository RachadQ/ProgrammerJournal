import React,{createContext,useState,ReactNode, useEffect} from "react";
import {AuthContextType } from "../../interface/AuthContext"
import Cookies from "js-cookie";


// Ensure AuthContext is properly typed
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [error, SetError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = Cookies.get("authToken");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children} {/* Ensure this exists and is properly passed */}
    </AuthContext.Provider>
  );
};

export default AuthProvider;