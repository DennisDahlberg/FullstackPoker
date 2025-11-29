// src/App.tsx
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";


function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="*" element={<div className="pt-20 text-center text-4xl">404 - Not Found</div>} />
      </Routes>
    </>
  );
}

export default App;