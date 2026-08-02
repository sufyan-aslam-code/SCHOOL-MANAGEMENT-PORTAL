import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  GraduationCap,
  Loader2,
  AlertCircle,
  FileText,
  Search,
  Briefcase
} from 'lucide-react';
import { useFaculty } from '../../hooks/useFaculty';

export const FacultyPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { faculty, isLoading, error } = useFaculty();

  const filteredFaculty = faculty?.filter((member) => {
    const query = searchQuery.toLowerCase();
    return (
      member.name?.toLowerCase().includes(query) ||
      member.designation?.toLowerCase().includes(query) ||
      member.subject_specialization?.toLowerCase().includes(query)
    );
  }).sort((a, b) => {
    // Sort by display_order from the database, fallback to 0 if null/undefined
    const orderA = a.display_order ?? 0;
    const orderB = b.display_order ?? 0;

    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-32 sm:pt-36 pb-16">
      {/* Page Header Banner */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-xl mb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900 to-slate-900 opacity-90 z-0"></div>
        <div className="max-w-7xl mx-auto relative z-10 space-y-4 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 bg-teal-800/80 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full">
              <Users className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Teaching Staff Directory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Our Dedicated Faculty & Staff
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Meet the experienced educators responsible for shaping young scholars at our institution.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center min-w-[160px] shadow-lg">
            <div className="text-2xl sm:text-3xl font-black text-amber-400">
              {faculty ? faculty.length : '0'}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-300 font-semibold uppercase tracking-wider mt-0.5">Faculty Members</div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search Bar Control */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Search Faculty Member</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, designation, or specialization..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:border-teal-600 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Data Loading State */}
        {isLoading && (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
            <p className="text-xs sm:text-sm font-medium text-slate-600">Fetching faculty registry from database...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <div>
              <h4 className="font-bold text-xs sm:text-sm">Failed to load faculty data</h4>
              <p className="text-xs mt-0.5">{error.message || 'Please check your connection and try again.'}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredFaculty?.length === 0 && (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm space-y-3">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">No Faculty Members Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no educators matching your search query.
            </p>
          </div>
        )}

        {/* Faculty Grid */}
        {!isLoading && !error && filteredFaculty?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredFaculty.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Decorative top accent border */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-600 to-emerald-500"></div>

                <div className="space-y-4 flex flex-col items-center text-center w-full">
                  {/* Centered Profile Picture */}
                  <div className="w-32 h-32 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-3xl border-4 border-teal-100 shadow-lg overflow-hidden group-hover:border-teal-400 group-hover:scale-105 transition-all duration-300 shrink-0 mt-2">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-16 h-16 text-teal-600" />
                    )}
                  </div>

                  <div className="space-y-1.5 w-full">
                    <span className="inline-block text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-200 shadow-sm">
                      {member.designation}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight tracking-tight truncate px-1" title={member.name}>
                      {member.name}
                    </h3>
                  </div>

                  {/* Details Section */}
                  <div className="text-[11px] sm:text-xs space-y-2 text-slate-600 border-t border-slate-100 pt-4 w-full text-left">
                    <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                      <GraduationCap className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="truncate font-medium" title={member.qualification}>{member.qualification || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                      <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="truncate font-medium" title={member.subject_specialization}>{member.subject_specialization || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                      <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">Exp: {member.experience_years ? `${member.experience_years} Years` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyPage;