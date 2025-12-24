import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, LayoutDashboard, User, LogOut } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--border-color)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-8">
        <Link to="/dashboard" className="flex items-center gap-3 text-[var(--text-primary)] no-underline">
          <div className="w-9 h-9">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="12" height="12" rx="3" fill="url(#gradient1)" />
              <rect x="18" y="2" width="12" height="12" rx="3" fill="url(#gradient2)" />
              <rect x="2" y="18" width="12" height="12" rx="3" fill="url(#gradient2)" />
              <rect x="18" y="18" width="12" height="12" rx="3" fill="url(#gradient1)" />
              <defs>
                <linearGradient id="gradient1" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="gradient2" x1="32" y1="0" x2="0" y2="32">
                  <stop stopColor="#06b6d4" />
                  <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary bg-clip-text text-transparent hidden sm:block">
            FlowDiagram
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/dashboard"
            className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
              transition-all duration-200 no-underline
              ${isActive('/dashboard') 
                ? 'text-primary-500 bg-primary-500/10' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }
            `}
          >
            <LayoutDashboard size={18} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link
            to="/profile"
            className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
              transition-all duration-200 no-underline
              ${isActive('/profile') 
                ? 'text-primary-500 bg-primary-500/10' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }
            `}
          >
            <User size={18} />
            <span className="hidden sm:inline">Profile</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-[var(--text-tertiary)] max-w-[180px] truncate hidden md:block">
              {user.email}
            </span>
          )}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] cursor-pointer transition-all duration-200 hover:text-primary-500 hover:border-primary-500"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};
