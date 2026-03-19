import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import LoginPage from "@/pages/auth/login";
import SignupPage from "@/pages/auth/register";
import HomePage from "@/pages/landing";

export const router = createBrowserRouter(
    createRoutesFromElements(
        <>

            <Route index element={<HomePage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/signup" element={<SignupPage/>}/>



        </>
    ))
