import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Award } from 'lucide-react';
import { SCHOOL_CONSTANTS } from '../../constants/schoolData';

export const NotFoundPage = () => {
  return (
    // Added pt-32 sm:pt-36 and min-h-screen to clear the fixed navbar properly
    <div className="min-h-screen bg-slate-50 pt-32 sm:pt-36 pb-16 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl text-center">
        <div className="w-20 h-20 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 mx-auto flex items-center justify-center font-black text-3xl shadow-inner">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Page Not Found</h1>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto font-medium">
            The page you are looking for does not exist or has been moved within the {SCHOOL_CONSTANTS.NAME} portal.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            to="/results"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl border border-slate-300 transition-all"
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>Result Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;