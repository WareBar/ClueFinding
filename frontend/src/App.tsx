import { router } from "@/routes";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "@/components/ui/sonner"
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {


  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <RouterProvider router={router}/>
      </GoogleOAuthProvider>
      <Toaster/>
    </AuthProvider>
  )
}

export default App
