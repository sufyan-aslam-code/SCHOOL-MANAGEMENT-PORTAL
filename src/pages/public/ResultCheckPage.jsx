import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  AlertCircle,
  FileText,
  ExternalLink,
  DownloadCloud,
  CheckCircle2,
  User,
  Hash,
  BookOpen
} from 'lucide-react';
import { useSessions, useClasses } from '../../hooks/useSchoolData';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const ResultCheckPage = () => {
  const [searchParams] = useSearchParams();
  const { sessions } = useSessions() || {};
  const { classes } = useClasses() || {};

  const [selectedClass, setSelectedClass] = useState(searchParams.get('class') || '');
  const [rollNumber, setRollNumber] = useState(searchParams.get('rollNo') || '');
  const [sessionName, setSessionName] = useState(searchParams.get('session') || '');
  const [searched, setSearched] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (sessions && sessions.length > 0 && !sessionName) {
      setSessionName(sessions[0].name);
    }
  }, [sessions, sessionName]);

  useEffect(() => {
    if (selectedClass && rollNumber && sessionName) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setSearched(true);

    if (!selectedClass || !rollNumber || !sessionName) {
      setResultData(null);
      return;
    }

    try {
      const { data: sessionObj } = await supabase
        .from('sessions')
        .select('id, name')
        .ilike('name', sessionName)
        .maybeSingle();

      if (!sessionObj) {
        setResultData(null);
        return;
      }

      const { data: studentObj, error } = await supabase
        .from('students')
        .select(`
          id,
          name,
          father_name,
          roll_no,
          result_file_url,
          classes!students_class_id_fkey (id, name),
          sessions!students_session_id_fkey (id, name)
        `)
        .eq('class_id', selectedClass)
        .eq('session_id', sessionObj.id)
        .eq('roll_no', parseInt(rollNumber.trim(), 10))
        .maybeSingle();

      if (error || !studentObj) {
        setResultData(null);
        return;
      }

      setResultData({
        name: studentObj.name,
        fatherName: studentObj.father_name || 'N/A',
        roll_no: studentObj.roll_no,
        className: studentObj.classes?.name || 'Selected Class',
        session: studentObj.sessions?.name || sessionName,
        result_file_url: studentObj.result_file_url,
      });

    } catch (error) {
      console.error("Result Search Error:", error);
      setResultData(null);
    }
  };

  const handleDownloadFile = async () => {
    if (!resultData?.result_file_url) return;

    setIsDownloading(true);
    const loadingToast = toast.loading('Downloading Official Result...');

    try {
      const response = await fetch(resultData.result_file_url);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const fileExtension = resultData.result_file_url.split('.').pop() || 'pdf';
      const safeStudentName = resultData.name.replace(/\s+/g, '_');

      link.download = `${safeStudentName}_${resultData.roll_no}.${fileExtension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Result downloaded successfully!', { id: loadingToast });
    } catch (error) {
      console.error("Download Failed:", error);
      toast.error('Failed to download the result file.', { id: loadingToast });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 sm:pt-36 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Student Result Portal
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto">
            Select the academic session, class, and roll number to securely access official examination results.
          </p>
        </div>

        {/* SEARCH FORM */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <form onSubmit={handleSearch} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Academic Session</label>
                <select
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-slate-700 font-medium cursor-pointer"
                >
                  <option value="">Select Session</option>
                  {(sessions || []).map((session) => (
                    <option key={session.id} value={session.name}>
                      {session.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-slate-700 font-medium cursor-pointer"
                >
                  <option value="">Select Class</option>
                  {(classes || [])
                    .filter((cls) => {
                      if (!cls.name) return false;
                      const cleanName = cls.name.trim().toLowerCase();
                      return ['6th', '7th', '8th'].includes(cleanName);
                    })
                    .map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Roll Number</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={rollNumber}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/\D/g, '');
                  setRollNumber(onlyNumbers);
                }}
                placeholder="Enter Student Roll No"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-slate-900 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 text-sm sm:text-base mt-2"
            >
              <Search className="w-5 h-5" />
              Check Result
            </button>
          </form>
        </div>

        {/* RESULTS SECTION */}
        {searched && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            {resultData ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">

                {/* SUCCESS HEADER - Only renders if result_file_url exists */}
                {resultData.result_file_url && (
                  <div className="bg-emerald-50/50 border-b border-emerald-100 p-6 sm:px-8 sm:py-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Result Found Successfully</h2>
                      <p className="text-sm text-emerald-700 font-medium mt-0.5">
                        Official record verified in the database for Session {resultData.session}
                      </p>
                    </div>
                  </div>
                )}

                {/* STUDENT DETAILS GRID */}
                <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white rounded-lg shadow-sm border border-slate-200 text-teal-600">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</p>
                        <p className="font-bold text-slate-900">{resultData.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white rounded-lg shadow-sm border border-slate-200 text-teal-600">
                        <User className="w-5 h-5 opacity-70" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Father's Name</p>
                        <p className="font-bold text-slate-900">{resultData.fatherName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white rounded-lg shadow-sm border border-slate-200 text-teal-600">
                        <Hash className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Roll Number</p>
                        <p className="font-bold text-teal-700 text-lg">{resultData.roll_no}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white rounded-lg shadow-sm border border-slate-200 text-teal-600">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Class</p>
                        <p className="font-bold text-slate-900">{resultData.className}</p>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="mt-8">
                    {resultData.result_file_url ? (
                      <div className="flex flex-col sm:flex-row gap-4">
                        <a
                          href={resultData.result_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md"
                        >
                          <FileText className="w-5 h-5" />
                          View Result Online
                          <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
                        </a>

                        <button
                          onClick={handleDownloadFile}
                          disabled={isDownloading}
                          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          <DownloadCloud className="w-5 h-5" />
                          {isDownloading ? "Downloading..." : "Download Result PDF"}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center flex flex-col items-center gap-2">
                        <AlertCircle className="w-6 h-6 text-amber-500" />
                        <p className="text-sm font-semibold text-amber-800">
                          Result file is not available for download yet.
                        </p>
                        <p className="text-xs text-amber-700/80 max-w-md">
                          The student is verified in the system, but the administration has not uploaded the official document.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-10 sm:p-12 rounded-3xl border border-red-100 shadow-sm text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-slate-900">No Record Found</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    We couldn't find a matching record. Please verify the session, class, and roll number and try again.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCheckPage;