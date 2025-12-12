import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import Home from "./Pages/Home/Home";
import SetAvatar from "./Pages/Avatar/setAvatar";
import "bootstrap/dist/css/bootstrap.min.css";
import LandingPage from "./Pages/LandingPage";
import SidebarLayout from "./components/layout/SidebarLayout";
import BudgetPage from "./Pages/BudgetPage";
import TransactionsPage from "./Pages/TransactionsPage";
import AnalyticsPage from "./Pages/AnalyticsPage";
import LimitationsPage from "./Pages/LimitationsPage";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        JSON.parse(user);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>;
  }

  const ProtectedRoute = ({ children }) => (isAuthenticated ? children : <Navigate to="/login" replace />);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
  {/* public routes */}
  <Route path="/" element={<Navigate to="/login" replace />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/landing" element={<LandingPage />} />
  <Route path="/setAvatar" element={<SetAvatar />} />

  
  {/* protected routes inside sidebar layout */}
  <Route element={<ProtectedRoute><SidebarLayout /></ProtectedRoute>}>
    <Route path="/home" element={<Home />} />
    <Route path="/transactions" element={<TransactionsPage />} />
    <Route path="/analytics" element={<AnalyticsPage />} />
    <Route path="/budget" element={<BudgetPage />} />
    <Route path="/limitations" element={<LimitationsPage />} />
    
  </Route>

  {/* fallback */}
  <Route path="*" element={<Navigate to="/login" replace />} />
</Routes>

      </BrowserRouter>
    </div>
  );
};

export default App;
