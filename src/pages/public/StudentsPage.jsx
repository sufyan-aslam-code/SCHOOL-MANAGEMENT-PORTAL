import React, { useState } from 'react';
import {
    Users,
    Search,
    Loader2,
    AlertCircle,
    FileText
} from 'lucide-react';
import { useStudents, useClasses, useSessions } from '../../hooks/useSchoolData';

export const StudentsPage = () => {
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSession, setSelectedSession] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Consume the existing student service hooks and database dynamic data
    const { students, isLoading: loadingStudents, error: studentsError } = useStudents(selectedClass);
    const { classes, isLoading: loadingClasses } = useClasses() || {};
    const { sessions, isLoading: loadingSessions } = useSessions() || {};

    const isLoading = loadingStudents || loadingClasses || loadingSessions;

    // Filter and sort students locally by name, father's name, roll number, and session
    const filteredStudents = (students || []).filter((student) => {
        const matchesSearch =
            `${student.name || ''} ${student.father_name || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.roll_no?.toString().includes(searchQuery);

        const matchesClass = selectedClass === '' || student.class_id == selectedClass;
        const matchesSession = selectedSession === '' || student.session_id == selectedSession;

        return matchesSearch && matchesClass && matchesSession;
    }).sort((a, b) => {
        // 1. Sort by Class Name alphabetically/numerically
        const classA = a.class_name || '';
        const classB = b.class_name || '';
        if (classA !== classB) {
            return classA.localeCompare(classB, undefined, { numeric: true });
        }

        // 2. Sort by Session Name if classes match
        const sessionA = a.session_name || '';
        const sessionB = b.session_name || '';
        if (sessionA !== sessionB) {
            return sessionA.localeCompare(sessionB, undefined, { numeric: true });
        }

        // 3. Sort cleanly by Roll Number (ascending) within the same class/session
        return (a.roll_no || 0) - (b.roll_no || 0);
    });

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-16">
            {/* Page Header Banner */}
            <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-xl mb-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-900 to-slate-900 opacity-90 z-0"></div>
                <div className="max-w-7xl mx-auto relative z-10 space-y-3 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 bg-teal-800/80 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                            <Users className="w-4 h-4 text-amber-400" />
                            <span>Public Student Directory</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            Enrolled Students Portal
                        </h1>
                        <p className="text-slate-300 text-sm max-w-xl">
                            Browse official student enrollments across various academic classes for the current session.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center min-w-[160px]">
                        <div className="text-2xl font-black text-amber-400">
                            {filteredStudents ? filteredStudents.length : '0'}
                        </div>
                        <div className="text-xs text-slate-300 font-medium uppercase mt-0.5">Records Found</div>
                    </div>
                </div>
            </section>

            {/* Main Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                {/* Filter & Search Bar Controls */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                    {/* Class Filter Dropdown */}
                    <div className="md:col-span-4">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Filter by Class</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none font-medium"
                        >
                            <option value="">All Classes</option>
                            {(classes || []).map((cls) => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Session Filter Dropdown */}
                    <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Filter by Session</label>
                        <select
                            value={selectedSession}
                            onChange={(e) => setSelectedSession(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none font-medium"
                        >
                            <option value="">All Sessions</option>
                            {(sessions || []).map((sess) => (
                                <option key={sess.id} value={sess.id}>{sess.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Search Query Input */}
                    <div className="md:col-span-5">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Search Student</label>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or roll number..."
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                            />
                        </div>
                    </div>

                </div>

                {/* Data Loading State */}
                {isLoading && (
                    <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
                        <p className="text-sm font-medium text-slate-600">Fetching student registry from database...</p>
                    </div>
                )}

                {/* Error State */}
                {studentsError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="font-bold text-sm">Failed to load student data</h4>
                            <p className="text-xs mt-0.5">{studentsError.message || 'Please check your connection and try again.'}</p>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !studentsError && filteredStudents?.length === 0 && (
                    <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm space-y-3">
                        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">No Students Found</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            There are no student records matching your selected filter criteria or search query.
                        </p>
                    </div>
                )}

                {/* Student Records Table View (Read-Only) */}
                {!isLoading && !studentsError && filteredStudents?.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                                        <th className="px-6 py-3 font-semibold whitespace-nowrap">S.No</th>
                                        <th className="px-6 py-3 font-semibold whitespace-nowrap">Roll No</th>
                                        <th className="px-6 py-3 font-semibold whitespace-nowrap">First Name</th>
                                        <th className="px-6 py-3 font-semibold whitespace-nowrap">Last Name</th>
                                        <th className="px-6 py-3 font-semibold whitespace-nowrap">Class</th>
                                        <th className="px-6 py-3 font-semibold whitespace-nowrap">Session</th>
                                        <th className="px-6 py-3 font-semibold whitespace-nowrap">Gender</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {filteredStudents.map((student, index) => (
                                        <tr key={student.id || student.roll_no} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-slate-500 font-medium">{index + 1}</td>
                                            <td className="px-6 py-4 text-slate-900 font-semibold">{student.roll_no}</td>
                                            <td className="px-6 py-4 text-slate-900 font-medium">{student.name}</td>
                                            <td className="px-6 py-4 text-slate-600">{student.father_name || '-'}</td>
                                            <td className="px-6 py-4 text-slate-600">{student.class_name || '-'}</td>
                                            <td className="px-6 py-4 text-slate-600">{student.session_name || '-'}</td>
                                            <td className="px-6 py-4 text-slate-600">{student.gender || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default StudentsPage;