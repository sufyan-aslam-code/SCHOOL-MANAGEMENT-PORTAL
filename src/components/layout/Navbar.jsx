import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Menu,
  X,
  Lock,
  Award,
  ShieldCheck,
  Users,
  Info,
  Home,
  UserCheck,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const { settings, isLoading } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Gallery', path: '/gallery', icon: ImageIcon },
    { name: 'Announcements', path: '/announcements', icon: ShieldCheck },
    { name: 'Faculty', path: '/faculty', icon: UserCheck },
    { name: 'Check Result', path: '/results', icon: Award, highlight: true },
    { name: 'About Us', path: '/about', icon: Info },
    { name: 'Contact Us', path: '/contact', icon: Users },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ease-in-out ${isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-100'
        : 'bg-white shadow-md'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* FIX: Restored fixed heights to prevent awkward vertical stretching */}
        <div className="flex justify-between items-center h-16 lg:h-20">

          {/* Logo & Dynamic School Name */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group max-w-[65%] lg:max-w-[40%] pr-2">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-700 to-emerald-900 flex items-center justify-center text-amber-400 shadow-md group-hover:scale-105 transition-all shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            {/* FIX: Added line-clamp-2 to school name and truncate to subtitle for clean layout */}
            <div className="flex flex-col justify-center min-w-0">
              <div className="text-[11px] sm:text-sm lg:text-[15px] font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors leading-tight line-clamp-2">
                Government High School Kasala
              </div>
              <div className="text-[9px] sm:text-[11px] text-slate-500 font-medium truncate mt-0.5">
                {isLoading ? 'Connecting...' : `${settings?.district || 'Abbottabad'}, ${settings?.province || 'Khyber Pakhtunkhwa'}`}
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links + Admin Portal Button */}
          <nav className="hidden xl:flex items-center gap-1 lg:gap-2 shrink-0">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);

              if (link.highlight) {
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="relative group inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-sm transition-all transform hover:-translate-y-0.5 ml-1"
                  >
                    <Icon className="w-4 h-4 group-hover:animate-bounce" />
                    <span>{link.name}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`group relative inline-flex items-center gap-1 px-2 py-2 text-sm font-semibold transition-colors rounded-lg ${active
                    ? 'text-teal-700 bg-teal-50/60'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
                    }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${active ? 'text-teal-700' : 'text-slate-400 group-hover:text-teal-600'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* Integrated Admin Portal Button */}
            <Link
              to="/admin/login"
              className="ml-3 inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm border border-slate-800 transform hover:-translate-y-0.5"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Portal</span>
            </Link>
          </nav>

          {/* Mobile Actions */}
          <div className="flex xl:hidden items-center gap-2 shrink-0">
            <Link
              to="/results"
              className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] sm:text-xs px-2.5 py-1.5 sm:py-2 rounded-xl shadow-sm whitespace-nowrap"
            >
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Results</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-700 hover:text-teal-700 hover:bg-slate-100 focus:outline-none transition-colors"
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                <span className={`absolute transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'}`}>
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                </span>
                <span className={`absolute transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`}>
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div
        className={`absolute top-full left-0 w-full xl:hidden bg-white/95 backdrop-blur-md shadow-2xl border-t border-slate-100 overflow-hidden transition-all duration-300 ease-in-out origin-top ${mobileMenuOpen ? 'max-h-[85vh] opacity-100 py-4' : 'max-h-0 opacity-0 py-0'
          }`}
      >
        <div className="px-4 space-y-1.5 overflow-y-auto max-h-[80vh]">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${active
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'text-slate-700 hover:bg-teal-50 hover:text-teal-800'
                  }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-2 border-t border-slate-100">
            <Link
              to="/admin/login"
              className="flex items-center justify-center gap-2 text-sm font-bold text-amber-400 bg-slate-900 hover:bg-slate-800 px-4 py-3.5 rounded-xl transition-colors w-full shadow-sm"
            >
              <Lock className="w-4 h-4" />
              <span>Admin Portal Login</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;