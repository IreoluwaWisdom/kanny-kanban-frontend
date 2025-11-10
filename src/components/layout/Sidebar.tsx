'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Settings, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true); // Always open on desktop
      } else {
        setIsOpen(false); // Closed by default on mobile
      }
    };

    // Set initial state
    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isSettingsPage = pathname === '/settings';

  const sidebarWidth = isExpanded ? 'w-64' : 'w-16';
  const showText = isOpen && isExpanded;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-3 right-3 sm:top-4 sm:right-4 z-50 p-2.5 bg-white border border-neutral-200 rounded-lg shadow-lg active:scale-95 transition-transform"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-900" />
        ) : (
          <div className="flex flex-col gap-1">
            <div className="w-5 sm:w-6 h-0.5 bg-neutral-900"></div>
            <div className="w-3.5 sm:w-4 h-0.5 bg-neutral-900"></div>
            <div className="w-4.5 sm:w-5 h-0.5 bg-neutral-900"></div>
          </div>
        )}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${sidebarWidth}
          bg-white border-r border-neutral-200 flex flex-col h-full fixed md:relative z-30 transition-all duration-300 ease-in-out
          shadow-lg md:shadow-none
        `}
      >
        {/* Header */}
        <div className="p-3 sm:p-4 md:p-6 border-b border-neutral-200 flex items-center justify-between flex-shrink-0">
          {showText && (
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 truncate">Kanny</h2>
          )}
          {/* Desktop expand/collapse button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hidden md:flex items-center justify-center p-1.5 hover:bg-neutral-100 rounded-md flex-shrink-0 transition-colors"
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <Menu className="h-5 w-5 text-neutral-600" />
          </button>
        </div>

        {/* Navigation - Empty since there's only one board */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {/* No board list needed - single board always loaded */}
        </div>

        {/* Bottom Section */}
        <div className="p-3 sm:p-4 border-t border-neutral-200 space-y-2 flex-shrink-0">
          {/* Settings */}
          {showText ? (
            <Link
              href="/settings"
              className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-md transition-colors active:scale-95 ${
                isSettingsPage
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200'
              }`}
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Settings</span>
            </Link>
          ) : (
            <Link
              href="/settings"
              className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-md transition-colors mx-auto active:scale-95 ${
                isSettingsPage
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200'
              }`}
              title="Settings"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          )}

          {/* User Profile */}
          <div className={`flex items-center ${showText ? 'gap-2 sm:gap-3 px-2 sm:px-3 py-2' : 'justify-center'} text-neutral-700`}>
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'User'}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover flex-shrink-0"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-300 flex items-center justify-center flex-shrink-0">
                <span className="text-xs sm:text-sm font-semibold text-neutral-700">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
            {showText && (
              <span className="flex-1 text-sm sm:text-base truncate">{user?.name}</span>
            )}
          </div>

          {/* Logout - Only show when expanded */}
          {showText && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 transition-colors active:scale-95"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Log Out</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
