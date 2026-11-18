import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import {
  ShieldAlert,
  Bell,
  MapPin,
  BarChart3,
  PlusCircle,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Building2,
  CheckCheck
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAuthority, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="CivicLens AI" className="w-9 h-9" />
            <div>
              <span className="font-extrabold text-xl tracking-tight text-navy-900 flex items-center gap-1.5">
                CivicLens <span className="text-teal-600 font-bold text-xs uppercase px-1.5 py-0.5 bg-teal-50 border border-teal-200 rounded">AI</span>
              </span>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                Report. Route. Resolve.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/') ? 'text-teal-700 bg-teal-50' : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>

            <Link
              to="/map"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/map') ? 'text-teal-700 bg-teal-50' : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4 text-teal-600" />
              Community Map
            </Link>

            <Link
              to="/analytics"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/analytics') ? 'text-teal-700 bg-teal-50' : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-teal-600" />
              Intelligence
            </Link>

            {/* Quick Report Button */}
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 ml-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              Report Issue
            </Link>
          </nav>

          {/* User & Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative p-2 text-slate-600 hover:text-navy-900 rounded-lg hover:bg-slate-100 transition"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-800">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-[11px] text-teal-600 hover:underline flex items-center gap-1"
                          >
                            <CheckCheck className="w-3 h-3" /> Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-xs text-slate-500 text-center">No notifications yet.</p>
                        ) : (
                          notifications.slice(0, 8).map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => {
                                markAsRead(notif._id);
                                if (notif.reportReferenceId) {
                                  navigate(`/reports/${notif.reportReferenceId}`);
                                  setNotificationOpen(false);
                                }
                              }}
                              className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition ${
                                !notif.isRead ? 'bg-teal-50/40 font-medium' : 'text-slate-600'
                              }`}
                            >
                              <p className="font-semibold text-navy-900 mb-0.5">{notif.title}</p>
                              <p className="text-[11px] text-slate-600 line-clamp-2">{notif.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Portal Access Links */}
                {isAuthority ? (
                  <Link
                    to="/authority"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-navy-900 text-white hover:bg-navy-800 rounded-lg text-xs font-semibold transition"
                  >
                    <Building2 className="w-3.5 h-3.5 text-teal-400" />
                    Authority Workspace
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-lg text-xs font-semibold transition"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-teal-600" />
                    Citizen Dashboard
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-purple-100 text-purple-900 hover:bg-purple-200 rounded-lg text-xs font-bold transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                    Admin
                  </Link>
                )}

                {/* User menu & logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-navy-900 leading-tight truncate max-w-[120px]">
                      {user.name}
                    </p>
                    <span className="text-[10px] uppercase font-bold text-teal-700">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-navy-900 transition"
                >
                  Citizen Sign In
                </Link>

                <Link
                  to="/authority/login"
                  className="inline-flex items-center gap-1 px-3 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-xs font-semibold transition shadow-sm"
                >
                  <Building2 className="w-3.5 h-3.5 text-teal-400" />
                  Authority Portal
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-navy-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/map"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Community Map
          </Link>
          <Link
            to="/analytics"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Municipal Intelligence
          </Link>
          <Link
            to="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold bg-teal-600 text-white text-center"
          >
            Report an Issue
          </Link>

          <div className="pt-3 border-t border-slate-200 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-1">
                  <p className="text-sm font-bold text-navy-900">{user.name}</p>
                  <p className="text-xs text-teal-700 uppercase font-semibold">{user.role}</p>
                </div>
                {isAuthority ? (
                  <Link
                    to="/authority"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 bg-navy-900 text-white rounded-lg text-sm font-semibold text-center"
                  >
                    Authority Workspace
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 bg-slate-100 text-slate-800 rounded-lg text-sm font-semibold text-center"
                  >
                    Citizen Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 bg-purple-100 text-purple-900 rounded-lg text-sm font-bold text-center"
                  >
                    Super Admin Control Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-center rounded-lg border border-slate-300 font-semibold text-slate-700"
                >
                  Citizen Sign In
                </Link>
                <Link
                  to="/authority/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-center rounded-lg bg-navy-900 text-white font-semibold text-sm"
                >
                  Official Authority Portal
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
