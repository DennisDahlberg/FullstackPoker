// src/App.tsx
import { Routes, Route } from "react-router-dom";
// import Navbar from "@/components/Navbar";
// import PrivateRoute from "@/components/PrivateRoute";
import PublicRoute from "@/components/PublicRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SidebarLayout from "./components/SidebarLayout";
import Dashboard from "./pages/Dashboard";


function App() {

  return (
    <>
      {/* <Navbar /> */}
      <Routes>
        <Route element={<SidebarLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="/login" element={<PublicRoute><Login/></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register/></PublicRoute>} />
        <Route path="*" element={<div className="pt-20 text-center text-4xl">404 - Not Found</div>} />
      </Routes>
    </>
  );
}

export default App;