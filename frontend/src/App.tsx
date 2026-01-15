import { Routes, Route } from "react-router-dom";
import PublicRoute from "@/components/PublicRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SidebarLayout from "./components/SidebarLayout";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import Game from "./pages/Game";
import Friends from "./pages/Friends";
import { Toaster } from "sonner";


function App() {

  return (
    <>
      <Toaster />
      <Routes>
        
        <Route element={<PrivateRoute><SidebarLayout /></PrivateRoute>}>          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="*" element={<div className="pt-20 text-center text-4xl">404 - Not Found</div>} />
        </Route>

        <Route path="/game" element={<PrivateRoute><Game /></PrivateRoute>} />

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicRoute><Login/></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register/></PublicRoute>} />        
      </Routes>
    </>
  );
}

export default App;