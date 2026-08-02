import React, { useState, useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap, LayoutDashboard, Users, Award, Upload,
  Settings, LogOut, Menu, X, ChevronRight, ShieldCheck, Loader2
} from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { AuthContext } from '../../contexts/AuthContext';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Consume the AuthContext
  const { logout } = useContext(AuthContext);

  const { settings, isLoading } = useSettings();

  const adminNav = [
    { name: 'Dashboard Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Student Management', path: '/admin/dashboard?tab=students', icon: Users },
    { name: 'Result Management', path: '/admin/dashboard?tab=results', icon: Upload },
    { name: 'Faculty Management', path: '/admin/dashboard?tab=faculty', icon: Award },
    { name: 'Settings', path: '/admin/dashboard?tab=settings', icon: Settings },
  ];

  // Updated async handleLogout using Supabase AuthContext
  const handleLogout = async () => {
    try {
      await logout(); // Clears Supabase session and user state
      navigate('/', { replace: true }); // Safely redirect and clear history stack
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Explicitly set height to screen to prevent entire body scroll
  return (
    <div className="h-screen bg-slate-100 flex flex-col overflow-hidden">

      {/* Top Admin Header */}
      <header className="bg-slate-900 text-white shadow-md z-40 shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>


            <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-amber-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base leading-tight text-white">
                {isLoading ? 'Loading...' : `${settings?.school_name || 'School'} - Admin Portal`}
              </h1>
              {/* <p className="text-xs text-teal-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 inline" /> Authorized Management Console
                </p> */}
            </div>

          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar Navigation - Removed overflow-y-auto to prevent scrolling */}
        <aside className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static pt-16 lg:pt-0 border-r border-slate-800 flex flex-col shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>

          {/* Changed overflow-y-auto to overflow-hidden here */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-hidden flex flex-col">
            <div className="space-y-1 flex-1">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname + location.search === item.path || (item.path === '/admin/dashboard' && location.pathname === '/admin/dashboard' && !location.search);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${isActive
                      ? 'bg-teal-700 text-white font-semibold shadow'
                      : 'hover:bg-slate-800 hover:text-white text-slate-300'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-amber-400" />}
                  </Link>
                );
              })}
            </div>

            {/* Dynamic DB Information Block pinned to the bottom of the nav area */}
            <div className="pt-6 shrink-0">
              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50 text-xs space-y-1.5 min-h-[70px]">
                <div className="font-semibold text-amber-400">Quick School Info</div>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-slate-400 mt-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Fetching DB...
                  </div>
                ) : (
                  <>
                    <div className="text-slate-400">EMIS: {settings?.emis_code || 'N/A'}</div>
                    <div className="text-slate-400">District: {settings?.district || 'N/A'}</div>
                  </>
                )}
              </div>
            </div>
          </nav>

          <div className="p-4 border-t border-slate-800 shrink-0">
            <Link
              to="/"
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-teal-400 rounded-lg text-xs font-semibold transition-colors"
            >
              <span>View Public Portal</span>
            </Link>
          </div>
        </aside>

        {/* Main Content Area - Keeps overflow-y-auto to allow scrolling */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;