import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Interviews", path: "/interviews" },
  { label: "Create Interview", path: "/create" },
  { label: "Settings", path: "/settings" },
];

export default function Sidebar() {
  const location = useLocation();
  
  return (
    <aside className="sidebar">
      <div className="sidebar-title">InterviewAdmin</div>
      <nav>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link${location.pathname === item.path ? " active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-user">
        <div className="avatar" />
        <div>
          <div className="user-name">Admin User</div>
          <div className="user-email">admin@company.com</div>
        </div>
      </div>
    </aside>
  );
} 