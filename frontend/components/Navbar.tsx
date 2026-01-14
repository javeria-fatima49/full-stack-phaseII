'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Menu, X, Plus, LayoutDashboard, CheckSquare, LogIn, UserPlus, LogOut } from 'lucide-react';
import { AnimatedButton } from '@/components/AnimatedButton';

export default function Navbar() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-900/90 backdrop-blur-md shadow-md py-2 border-b border-slate-800'
          : 'bg-slate-900/80 backdrop-blur-sm py-4 border-b border-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 text-xl font-bold text-cyan-400 hover:text-cyan-300 transition-colors hover-link"
              onClick={handleNavClick}
            >
              <CheckSquare className="h-6 w-6" />
              <span>Todo App</span>
            </Link>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-cyan-400 hover:bg-slate-800/50 transition-colors hover-link"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            {isAuthenticated() && (
              <>
                <Link
                  href="/tasks"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-cyan-400 hover:bg-slate-800/50 transition-colors hover-link"
                >
                  <CheckSquare className="h-4 w-4" />
                  <span>Tasks</span>
                </Link>
                <Link
                  href="/tasks/create"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-cyan-400 hover:bg-slate-800/50 transition-colors hover-link"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Task</span>
                </Link>
              </>
            )}
          </div>

          {/* Auth/Profile Section */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : isAuthenticated() ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300 hidden sm:block">
                  Welcome, {user?.name || user?.email?.split('@')[0]}
                </span>
                <AnimatedButton
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors hover-button"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </AnimatedButton>
              </div>
            ) : (
              <div className="flex space-x-2">
                <AnimatedButton asChild>
                  <Link href="/login" className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors hover-button">
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                </AnimatedButton>
                <AnimatedButton asChild>
                  <Link href="/signup" className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors hover-button">
                    <UserPlus className="h-4 w-4" />
                    <span>Sign Up</span>
                  </Link>
                </AnimatedButton>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-300 hover:text-cyan-400 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 hover-button"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-900 border-t border-slate-800 rounded-b-lg shadow-lg">
              <Link
                href="/"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors hover-link"
                onClick={handleNavClick}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              {isAuthenticated() && (
                <>
                  <Link
                    href="/tasks"
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors hover-link"
                    onClick={handleNavClick}
                  >
                    <CheckSquare className="h-5 w-5" />
                    <span>Tasks</span>
                  </Link>
                  <Link
                    href="/tasks/create"
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors hover-link"
                    onClick={handleNavClick}
                  >
                    <Plus className="h-5 w-5" />
                    <span>Create Task</span>
                  </Link>
                </>
              )}
              {loading ? (
                <div className="px-3 py-2 text-gray-400">Loading...</div>
              ) : isAuthenticated() ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-300 border-t border-slate-800 pt-3">
                    Welcome, {user?.name || user?.email?.split('@')[0]}
                  </div>
                  <AnimatedButton
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors hover-button"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </AnimatedButton>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <AnimatedButton asChild>
                    <Link href="/login" className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors hover-button">
                      <LogIn className="h-5 w-5" />
                      <span>Login</span>
                    </Link>
                  </AnimatedButton>
                  <AnimatedButton asChild>
                    <Link href="/signup" className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors hover-button">
                      <UserPlus className="h-5 w-5" />
                      <span>Sign Up</span>
                    </Link>
                  </AnimatedButton>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}