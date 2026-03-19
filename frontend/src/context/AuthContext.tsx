import { 
    createContext, 
    useContext, 
    useState, 
    useEffect, 
    useCallback,
    type ReactNode,
} from "react";
import axios from 'axios'


// the backend url
const API_URL = 'http://127.0.0.1:8000'


// type definitions
interface AuthProviderProps {
    children: ReactNode,
}

interface User {
  id: number;
  email: string;
  first_name?: string; // Optional properties
  last_name?: string;
  role:string
}



// Define the shape of the AuthContext value
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  loginWithGoogle: (token: string) => Promise<{ success: boolean; user?: User; error?: any }>;
  logout: () => void;
  register: (userData: any) => Promise<{ success: boolean; message?: string; error?: any }>;
  fetchUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({children}:AuthProviderProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // function to embed the tokens into local storage
    const setTokens = (accessToken: string, refreshToken: string) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        setIsAuthenticated(true);
    };


    // function to clear the embedded tokens from local storage, used when logging out
    const clearTokens = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
    };


    // used to fetch user profiles
    const fetchUserProfile = useCallback(async () => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            setUser(null);
            setIsAuthenticated(false);
            return;
        }

        try {
        const response = await axios.get(`${API_URL}/user/me`, {
            headers: {
            Authorization: `Bearer ${accessToken}`,
            },
        });
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
        setIsAuthenticated(true);
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
            // await refreshAccessToken();
        } finally {
            setIsLoading(false);
        }
    }, []);



    // uses to refresh access token
    const refreshAccessToken = useCallback(async ():Promise<boolean> => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            clearTokens();
            return false;
        }

        try {
        const response = await axios.post(`${API_URL}/auth/token/refresh`, {
            refresh: refreshToken,
        });
        const newAccessToken = response.data.access;
        localStorage.setItem("accessToken", newAccessToken);
        setIsAuthenticated(true);
        await fetchUserProfile();
        return true;
        } catch (error) {
            console.error("Failed to refresh token:", error);
            clearTokens();
            return false;
        }
    }, []);



    // upon mounting this component this function runs
    useEffect(() => {
    const checkAuth = async () => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
        await fetchUserProfile();
        } else {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        }
    };
    checkAuth();
    }, []);

    

    // function for logging in
    const login = async (email:string, password:string) => {
    try {
        const response = await axios.post(`${API_URL}/auth/token/`, {
        email,
        password,
        });
        console.log(response)
        setTokens(response.data.access, response.data.refresh);
        await fetchUserProfile();
        // return { success: true };
        return { success: true, user: JSON.parse(localStorage.getItem("user") || "{}") }; // or return from fetchUserProfile
    } catch (error) {
        console.error("Login failed:", error.response?.data || error.message);
        return {
        success: false,
        error: error.response?.data || { detail: "An unexpected error occurred." },
        };
    }
    };



    // function for logging in with Google
    const loginWithGoogle = async (googleToken: string) => {
    try {
        const response = await axios.post(`${API_URL}/auth/google/`, {
        token: googleToken,
        });
        const { access, refresh, user } = response.data;

        // Store tokens & user in localStorage
        setTokens(access, refresh);
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));

        return { success: true, user };
    } catch (error) {
        console.error("Google login failed:", error.response?.data || error.message);
        return {
        success: false,
        error: error.response?.data || { detail: "Google login failed." },
        };
    }
    };



    // function for logging out
    // simply removes the tokens 
    const logout = () => {
        clearTokens();
    };


    // function for registering user
    const register = async (userData: any) => {
        try {
        const response = await axios.post(`${API_URL}/user/`, userData);
        console.log(response)
        return {
            success: true,
            message: response.data.detail || "Registration successful. You can now log in.",
        };
        } catch (error) {
        console.error("Registration failed:", error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || { detail: "An unexpected error occurred." },
        };
        }
    };



    // collecting the functions for external use
    const value:AuthContextType = {
        isAuthenticated,
        user,
        isLoading,
        login,
        logout,
        register,
        fetchUserProfile,
        loginWithGoogle
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

}