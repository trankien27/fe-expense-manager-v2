// src/components/Header.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";

export default function Header() {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
    // thêm transition khi load lần đầu
    document.documentElement.classList.add("transition-colors", "duration-500", "ease-in-out");
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const navItems = [
    { to: "/", label: "Dashboard" },
    { to: "/transaction", label: "Giao dịch" },
    { to: "/wallets", label: "Ví tiền" },
    { to: "/categories", label: "Danh mục" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md border-b border-gray-200 dark:border-gray-700 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">₫</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-500">
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
                  `relative text-base font-medium transition-colors duration-300 ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400 transition-transform duration-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-200 transition-transform duration-300" />
              )}
            </button>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-colors duration-300"
              >
                Đăng xuất
              </button>
            ) : (
              <NavLink
                to="/login"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-colors duration-300"
              >
                Đăng nhập
              </NavLink>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              )}
            </button>

            <button
              onClick={() => setOpen(!open)}
              className="p-2 text-gray-700 dark:text-gray-200 hover:text-indigo-600 transition-colors duration-300"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg rounded-b-lg px-4 py-3 space-y-2 animate-slideDown transition-colors duration-500">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-300"
            >
              Đăng xuất
            </button>
          ) : (
            <NavLink
              to="/login"
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-center transition-colors duration-300"
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
