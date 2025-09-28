// src/components/Header.tsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react"; // icon menu mobile

export default function Header() {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/", label: "Dashboard" },
    { to: "/transaction", label: "Giao dịch" },
    { to: "/wallets", label: "Ví tiền" },
    { to: "/categories", label: "Danh mục" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">₫</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">
              Quản lý chi tiêu
            </h1>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `relative text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-indigo-600 font-semibold"
                      : "text-gray-700 hover:text-indigo-500"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Auth buttons (desktop) */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all duration-200"
              >
                Đăng xuất
              </button>
            ) : (
              <NavLink
                to="/login"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all duration-200"
              >
                Đăng nhập
              </NavLink>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setOpen(!open)}
              className="p-2 text-gray-700 hover:text-indigo-600 transition-colors"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg shadow-lg rounded-b-lg px-4 py-3 space-y-2 animate-slideDown">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-all duration-200"
            >
              Đăng xuất
            </button>
          ) : (
            <NavLink
              to="/login"
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-center transition-all duration-200"
              onClick={() => setOpen(false)}
            >
              Đăng nhập
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
}
