// src/components/Header.tsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import '../assets/Header.css'
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate();
   const [isMenuOpen, setIsMenuOpen] = React.useState(false);
   const hanldeDashBoard = () =>{
    navigate("/")
   }

    //   const toggleMenu = () => {
    //     setIsMenuOpen(!isMenuOpen);
    //   };

  return (
<header className="header-bg top-5 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold logo-text">Quản lý chi tiêu</h1>
                </div>

                <div className="flex-1"></div>

    
                <nav className="hidden md:flex items-center space-x-8 mr-8">
                    <a className="text-xl nav-item active text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium" onClick={hanldeDashBoard}>
                        Dashboard
                    </a>
                    <a className="text-xl nav-item text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium" onClick={()=> navigate("/transaction")}>
                        Giao dịch
                    </a>
                    <a className="text-xl nav-item text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                        Báo cáo
                    </a>
                    <a className="text-xl nav-item text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                        Cài đặt
                    </a>
                </nav>


                <div className="flex items-center">
                    <button className="logout-btn text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md" onClick={logout}>
                        <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        Đăng xuất
                    </button>
                </div>

                <div className="md:hidden">
                    <button id="mobile-menu-btn" className="text-gray-700 hover:text-indigo-600 p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div id="mobile-menu" className="md:hidden hidden bg-white rounded-lg shadow-lg mt-2 py-2">
                <a href="#dashboard" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">Dashboard</a>
                <a href="#transactions" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">Giao dịch</a>
                <a href="#reports" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">Báo cáo</a>
                <a href="#settings" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">Cài đặt</a>
            </div>
        </div>
    </header>
  );
}
