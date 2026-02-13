import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import OfflineIndicator from "./OfflineIndicator";
import {
  IconCreditCard,
  IconUser,
  IconLogout,
  IconMenu,
  IconClose,
} from "./Icons";

const Layout = ({ children }) => {
  const { user, lineProfile, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Navigation items for USER only
  const navigation = [
    {
      name: "สินเชื่อของฉัน",
      href: "/my-loans",
      icon: IconCreditCard,
    },
    {
      name: "โปรไฟล์",
      href: "/profile",
      icon: IconUser,
    },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50">
      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg shadow-teal-200/50">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link to="/my-loans" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full p-1 shadow-md">
              <img
                src="/assets/images/logo.png"
                alt="SPSC"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-lg font-bold text-white">
              EasyLoan System
            </span>
          </Link>

          {/* User info & Menu toggle */}
          <div className="flex items-center space-x-3">
            {/* User avatar */}
            {lineProfile?.pictureUrl ? (
              <img
                src={lineProfile.pictureUrl}
                alt=""
                className="w-8 h-8 rounded-full border-2 border-white/50 shadow"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
                <span className="text-white text-sm font-medium">
                  {user?.full_name?.charAt(0) || "U"}
                </span>
              </div>
            )}

            {/* Menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              {menuOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-16 right-0 z-50 w-64 bg-white/95 backdrop-blur shadow-xl rounded-bl-2xl border-l border-b border-teal-100 transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-teal-100 bg-gradient-to-r from-teal-50 to-cyan-50">
          <p className="font-medium text-teal-800">
            {user?.full_name || lineProfile?.displayName}
          </p>
          <p className="text-sm text-teal-600">สมาชิก</p>
          <p className="text-xs text-teal-500 mt-1">
            เลขสมาชิก: {user?.memb_no}
          </p>
        </div>

        <nav className="p-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.href)
                  ? "bg-teal-100 text-teal-700 border border-teal-200"
                  : "text-gray-600 hover:bg-teal-50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}

          <hr className="my-3 border-teal-100" />

          <button
            onClick={() => {
              setMenuOpen(false);
              logout();
            }}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <IconLogout className="w-5 h-5" />
            <span>ออกจากระบบ</span>
          </button>
        </nav>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-teal-100 shadow-lg">
        <div className="flex justify-around py-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 ${
                isActive(item.href)
                  ? "text-teal-600 bg-teal-50"
                  : "text-gray-400 hover:text-teal-500"
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-24 px-4 max-w-lg mx-auto">{children}</main>
    </div>
  );
};

export default Layout;
