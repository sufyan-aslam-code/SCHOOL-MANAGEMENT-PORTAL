import React from 'react';
import {
    Users,
    ShieldCheck,
    GraduationCap,
    Library,
    ArrowRight,
    Lock,
    Loader2
} from 'lucide-react';
import { useStudents, useClasses, useSessions } from '../../hooks/useSchoolData';
import { Link } from 'react-router-dom'; // Assuming you use react-router-dom

export const StudentsPage = () => {
    // Fetch data for aggregate statistics only
    const { students, isLoading: loadingStudents } = useStudents();
    const { classes, isLoading: loadingClasses } = useClasses() || {};
    const { sessions, isLoading: loadingSessions } = useSessions() || {};

    const isLoading = loadingStudents || loadingClasses || loadingSessions;

    // Calculate safe aggregate metrics
    const totalStudents = students?.length || 0;
    const totalClasses = classes?.length || 0;
    const activeSessions = sessions?.length || 0;

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-16">
            {/* Page Header Banner */}
            <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-xl mb-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-900 to-slate-900 opacity-90 z-0"></div>
                
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-teal-500 rounded-full blur-3xl opacity-10"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-amber-500 rounded-full blur-3xl opacity-10"></div>

                <div className="max-w-7xl mx-auto relative z-10 space-y-4 text-center">
                    <div className="inline-flex items-center justify-center gap-2 bg-teal-800/80 text-amber-300 text-xs font-semibold px-4 py-2 rounded-full border border-teal-700/50 shadow-sm">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Privacy-First Student Portal</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                        Student Demographics
                    </h1>
                    <p className="text-slate-300 text-sm max-w-2xl mx-auto">
                        A high-level overview of our growing academic community. For security purposes, individual student records are restricted to authenticated users.
                    </p>
                </div>
            </section>

            {/* Main Content Container */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                {/* Privacy & Security Notice */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6 md:gap-8">
                    <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center shrink-0 border-4 border-teal-100">
                        <Lock className="w-8 h-8" />
                    </div>
                    <div className="text-center md:text-left space-y-2 flex-1">
                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                            Data Protection & Privacy Policy
                        </h2>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            To ensure the safety and privacy of our students, we do not publish Personally Identifiable Information (PII) such as names, parent details, or roll numbers in a public directory. Parents and students must use our secure <strong>Result Checker</strong> to access academic records.
                        </p>
                    </div>
                    
                    {/* Action Button to redirect to the Result Checker */}
                    {/* Note: Update the 'to="/results"' path to match your actual Result Checker route */}
                    <Link 
                        to="/results" 
                        className="w-full md:w-auto shrink-0 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2"
                    >
                        <span>Access Result Checker</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Data Loading State */}
                {isLoading ? (
                    <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
                        <p className="text-sm font-medium text-slate-600">Calculating demographic data...</p>
                    </div>
                ) : (
                    /* Aggregate Statistics Grid */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Total Students Stat */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrollment</p>
                                    <p className="text-3xl font-black text-slate-900">{totalStudents}</p>
                                </div>
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Users className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <p className="text-xs text-slate-500 font-medium">Active students currently registered across all sessions.</p>
                            </div>
                        </div>

                        {/* Total Classes Stat */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Classes</p>
                                    <p className="text-3xl font-black text-slate-900">{totalClasses}</p>
                                </div>
                                <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Library className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <p className="text-xs text-slate-500 font-medium">Distinct grade levels accommodated by our faculty.</p>
                            </div>
                        </div>

                        {/* Active Sessions Stat */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Managed Sessions</p>
                                    <p className="text-3xl font-black text-slate-900">{activeSessions}</p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <p className="text-xs text-slate-500 font-medium">Ongoing academic years maintained in our database.</p>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentsPage;