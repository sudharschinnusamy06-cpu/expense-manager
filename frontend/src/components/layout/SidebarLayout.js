// src/Pages/SidebarLayout.js (or wherever it is)
import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import "./SidebarLayout.css";

const SidebarLayout = () => {
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.startsWith("/transactions")) return "CashFlow";
    if (location.pathname.startsWith("/analytics")) return "Financial Hub";
    if (location.pathname.startsWith("/budget")) return "Budget Studio";
    if (location.pathname.startsWith("/limitations")) return "Limitations";
    // default for /home or anything else
    return "Dashboard";
  };

  return (
    <div className="sl-root">
      <aside className="sl-sidebar">
        <div className="sl-logo">SpendWise</div>
        <nav className="sl-nav">
          <NavLink to="/home" className="sl-link">
            Dashboard
          </NavLink>
          <NavLink to="/transactions" className="sl-link">
            Income &amp; Expense
          </NavLink>
          <NavLink to="/analytics" className="sl-link">
            Analytics
          </NavLink>
          <NavLink to="/budget" className="sl-link">
            Budget
          </NavLink>
          <NavLink to="/limitations" className="sl-link">
            Limitations
          </NavLink>
        </nav>
        <div className="sl-footer">
          <button
            className="sl-logout-btn"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="sl-main">
        <header className="sl-topbar">
          <h2>{getPageTitle()}</h2>
        </header>
        <div className="sl-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
