import React from 'react';
import {
  Building2,
  GraduationCap,
  Award,
  BookOpen,
  Target,
  Eye,
  Clock,
  FlaskConical,
  Loader2
} from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

export const AboutPage = () => {
  const { settings, isLoading } = useSettings();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-500 gap-3 bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <p className="text-sm font-medium">Loading school details...</p>
      </div>
    );
  }

  const schoolName = settings?.school_name || 'Government High School Kasala';
  const establishedYear = settings?.established || '1975';
  const emisCode = settings?.emis_code || 'Loading...';
  const district = settings?.district || 'Abbottabad';
  const province = settings?.province || 'Khyber Pakhtunkhwa';

  return (
    <div className="min-h-screen bg-slate-50 pt-32 sm:pt-36 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-teal-800 to-emerald-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl text-center space-y-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
          <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 mx-auto flex items-center justify-center text-amber-400 backdrop-blur-md border border-white/20 shadow-inner">
              <GraduationCap className="w-9 h-9" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{schoolName}</h1>
            <p className="text-teal-200 text-sm sm:text-base max-w-2xl mx-auto font-medium">
              Established in {establishedYear} &bull; EMIS Code: {emisCode} &bull; District {district}
            </p>
          </div>
        </div>

        {/* Vision & Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 shadow-sm">
              <Target className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              To provide high-quality secondary education to students in Kasala and surrounding regions of {district}, fostering moral values, critical thinking, practical science skills, and digital literacy.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 shadow-sm">
              <Eye className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Our Vision</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              To be a model government secondary institution in {province} that empowers young minds through technology, disciplined academic rigorousness, and inclusive growth.
            </p>
          </div>
        </div>

        {/* Key Details Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">
            Academic Overview & Facilities
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2.5 p-5 bg-slate-50 rounded-2xl border border-slate-200/60 hover:bg-slate-100/50 transition-colors">
              <BookOpen className="w-6 h-6 text-teal-700" />
              <h3 className="font-bold text-slate-900 text-sm">Classes 6th to 10th</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Official curriculum aligned with {province} Textbook Board standards.</p>
            </div>

            <div className="space-y-2.5 p-5 bg-slate-50 rounded-2xl border border-slate-200/60 hover:bg-slate-100/50 transition-colors">
              <FlaskConical className="w-6 h-6 text-amber-700" />
              <h3 className="font-bold text-slate-900 text-sm">Science Laboratories</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Dedicated laboratories equipped for Physics, Chemistry, and Biology practical experiments.</p>
            </div>

            <div className="space-y-2.5 p-5 bg-slate-50 rounded-2xl border border-slate-200/60 hover:bg-slate-100/50 transition-colors">
              <Award className="w-6 h-6 text-emerald-700" />
              <h3 className="font-bold text-slate-900 text-sm">Qualified Staff</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Certified SST, CT, PET, DM, AT teachers with subject specializations.</p>
            </div>

            <div className="space-y-2.5 p-5 bg-slate-50 rounded-2xl border border-slate-200/60 hover:bg-slate-100/50 transition-colors">
              <Clock className="w-6 h-6 text-indigo-700" />
              <h3 className="font-bold text-slate-900 text-sm">Discipline & Attendance</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Strict attendance monitoring and moral character building.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;