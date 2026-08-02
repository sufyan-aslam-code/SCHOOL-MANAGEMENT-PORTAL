import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Contact2,
    LayoutGrid,
    UserPlus,
    UploadCloud,
    Settings
} from 'lucide-react';

import { useStudents } from '../../hooks/useSchoolData';
import useFaculty from '../../hooks/useFaculty';
import { useResults } from '../../hooks/useResults';

export const OverviewTab = () => {
    // Initialize navigation hook
    const navigate = useNavigate();

    // Fetch data
    const { students, loading: loadingStudents } = useStudents() || {};
    const { faculty, isLoading: loadingFaculty } = useFaculty() || {};
    const { isUploading } = useResults() || {};

    // Derived metric: Get active classes
    const activeClassesCount = useMemo(() => {
        if (!students) return 0;
        return new Set(students.map(s => s.class_id).filter(Boolean)).size;
    }, [students]);

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="border-b border-slate-200/60 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">System Overview</h2>
                    <p className="text-sm text-slate-500 mt-2">
                        Government High School Kasala — Administrative Command Center
                    </p>
                </div>

                {/* System Status Indicator */}
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">System Online</span>
                </div>
            </div>

            {/* Primary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Total Students */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-slate-500">Total Enrolled</div>
                        <div className="text-3xl font-black text-slate-900 mt-1">
                            {loadingStudents ? (
                                <div className="h-9 w-20 bg-slate-100 rounded animate-pulse" />
                            ) : (
                                students?.length || 0
                            )}
                        </div>
                    </div>
                </div>

                {/* Total Faculty */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Contact2 className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-slate-500">Active Staff</div>
                        <div className="text-3xl font-black text-slate-900 mt-1">
                            {loadingFaculty ? (
                                <div className="h-9 w-20 bg-slate-100 rounded animate-pulse" />
                            ) : (
                                faculty?.length || 0
                            )}
                        </div>
                    </div>
                </div>

                {/* Active Classes */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <LayoutGrid className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-slate-500">Active Classes</div>
                        <div className="text-3xl font-black text-slate-900 mt-1">
                            {loadingStudents ? (
                                <div className="h-9 w-16 bg-slate-100 rounded animate-pulse" />
                            ) : (
                                activeClassesCount
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="pt-4">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Updates URL to ?tab=students */}
                    <button
                        onClick={() => navigate('?tab=students')}
                        className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-teal-300 hover:shadow-sm transition-all group"
                    >
                        <UserPlus className="w-6 h-6 text-slate-400 group-hover:text-teal-600 mb-3 transition-colors" />
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">Register Student</span>
                    </button>

                    {/* Updates URL to ?tab=faculty */}
                    <button
                        onClick={() => navigate('?tab=faculty')}
                        className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-purple-300 hover:shadow-sm transition-all group"
                    >
                        <Contact2 className="w-6 h-6 text-slate-400 group-hover:text-purple-600 mb-3 transition-colors" />
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">Faculty Management</span>
                    </button>

                    {/* Updates URL to ?tab=results */}
                    <button
                        onClick={() => navigate('?tab=results')}
                        className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-blue-300 hover:shadow-sm transition-all group"
                    >
                        <UploadCloud className={`w-6 h-6 mb-3 transition-colors ${isUploading ? 'text-blue-500 animate-bounce' : 'text-slate-400 group-hover:text-blue-600'}`} />
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                            {isUploading ? 'Uploading...' : 'Upload Results'}
                        </span>
                    </button>

                    {/* Updates URL to ?tab=settings */}
                    <button
                        onClick={() => navigate('?tab=settings')}
                        className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-amber-300 hover:shadow-sm transition-all group"
                    >
                        <Settings className="w-6 h-6 text-slate-400 group-hover:text-amber-600 mb-3 transition-colors" />
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">System Settings</span>
                    </button>

                </div>
            </div>

        </div>
    );
};