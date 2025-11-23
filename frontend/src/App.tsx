// src/App.tsx
import { Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Home from "./pages/Home";


function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="*" element={<div className="pt-20 text-center text-4xl">404 - Not Found</div>} />
      </Routes>
    </>
  );
}

export default App;