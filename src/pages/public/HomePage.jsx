import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Award,
  Users,
  ChevronRight,
  Building2,
  MapPin,
  Sparkles,
  UserCheck,
  BookOpen,
  Laptop
} from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { useStudents } from '../../hooks/useSchoolData';

export const HomePage = () => {
  const { settings, isLoading } = useSettings();
  const { students, loading: studentsLoading } = useStudents();

  const formatStudentCount = (count) => {
    if (count < 50) return '200+';
    const rounded = Math.floor(count / 10) * 10;
    return `${rounded}+`;
  };

  const studentCount = studentsLoading ? '250+' : formatStudentCount(students.length);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16 bg-slate-50 min-h-screen pt-20 sm:pt-24 overflow-x-hidden">

      {/* Hero Banner Section */}
      <section className="relative bg-slate-900 overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-28 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-slate-900 to-emerald-950 opacity-90 z-0"></div>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Hero Left Content */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left mt-4 lg:mt-0">
            <div className="inline-flex items-center gap-2 bg-teal-800/60 backdrop-blur-md border border-teal-500/30 text-amber-300 text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span>Official Digital Portal & Academic Hub</span>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                {settings?.school_name || 'Government High School Kasala'}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-light px-2 sm:px-0">
                Nurturing character, academic excellence, and technical empowerment for secondary education in District {settings?.district || 'Abbottabad'}, {settings?.province || 'Khyber Pakhtunkhwa'}.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 max-w-sm sm:max-w-md mx-auto lg:mx-0">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center hover:bg-white/10 transition-colors">
                <div className="text-xl sm:text-3xl font-black text-amber-400">{settings?.established || '1975'}</div>
                <div className="text-[10px] sm:text-xs text-slate-300 font-medium uppercase tracking-wider mt-1">Established</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center hover:bg-white/10 transition-colors">
                <div className="text-xl sm:text-3xl font-black text-amber-400">{studentCount}</div>
                <div className="text-[10px] sm:text-xs text-slate-300 font-medium uppercase tracking-wider mt-1">Students</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center hover:bg-white/10 transition-colors">
                <div className="text-xl sm:text-3xl font-black text-amber-400">6th-10th</div>
                <div className="text-[10px] sm:text-xs text-slate-300 font-medium uppercase tracking-wider mt-1">Classes</div>
              </div>
            </div>

            {/* Hero CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-4 px-4 sm:px-0">
              <Link
                to="/results"
                className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                <Award className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Check DMC Results</span>
              </Link>

              <Link
                to="/about"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 text-white font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl border-2 border-white/20 hover:border-white/40 transition-all"
              >
                <span>Discover More</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Hero Right: Dynamic School Image Showcase */}
          <div className="relative mx-auto w-full max-w-sm sm:max-w-lg lg:max-w-none px-4 sm:px-0">
            <div className="absolute -inset-4 bg-gradient-to-tr from-teal-500 to-amber-500 opacity-20 blur-2xl rounded-full"></div>

            <div className="relative bg-slate-800 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 border border-slate-700/50 shadow-2xl transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
              {/* Changed from fixed h-80 to natural scaling layout with object-contain */}
              <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-slate-900 relative flex items-center justify-center group">

                {settings?.hero_image_url ? (
                  <img
                    src={settings.hero_image_url}
                    alt={`${settings?.school_name} Building`}
                    className="w-full h-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 py-16">
                    <Building2 className="w-12 h-12 sm:w-16 sm:h-16 mb-2 opacity-50" />
                    <span className="text-xs sm:text-sm font-medium">No Image Uploaded</span>
                  </div>
                )}
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-4 sm:-bottom-6 left-4 sm:-left-6 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl flex items-center gap-2 sm:gap-3 border border-slate-100">
                <div className="bg-teal-100 p-1.5 sm:p-2 rounded-lg text-teal-700">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase">Location</p>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate max-w-[120px] sm:max-w-none">{settings?.district || 'Abbottabad'}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">

        {/* Dynamic Principal Message Section */}
        <section className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <UserCheck className="hidden sm:block absolute -bottom-10 -right-10 w-64 h-64 text-slate-50 opacity-50 rotate-12 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start relative z-10">
            <div className="lg:col-span-4 flex flex-col items-center text-center space-y-3 sm:space-y-4">
              <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-teal-700 to-emerald-900 flex items-center justify-center text-amber-400 shadow-2xl border-4 sm:border-8 border-slate-50 relative overflow-hidden">
                {settings?.principal_image_url ? (
                  <img
                    src={settings.principal_image_url}
                    alt={settings?.principal_name || 'Headmaster'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCheck className="w-16 h-16 sm:w-24 sm:h-24" />
                )}
                <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-amber-500 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 sm:border-4 border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">{settings?.principal_name || 'Headmaster Name'}</h3>
                <p className="text-teal-700 font-medium text-xs sm:text-sm">HEADMASTER, {settings?.school_name || 'GHS Kasala'}</p>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4 sm:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-teal-100">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Message from the Headmaster
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                {settings?.hero_heading || 'Empowering the Next Generation of Leaders'}
              </h2>

              <div className="prose prose-slate max-w-none space-y-3 sm:space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed text-left">
                {settings?.principal_message ? (
                  <p className="whitespace-pre-line">{settings.principal_message}</p>
                ) : (
                  <>
                    <p>
                      Welcome to {settings?.school_name || 'Government High School Kasala'}. Since our establishment in {settings?.established || '1975'}, we have remained steadfast in our commitment to providing accessible, high-quality secondary education to the youth of District {settings?.district || 'Abbottabad'}.
                    </p>
                    <p>
                      Our dedicated faculty works tirelessly to ensure that every student is equipped with the knowledge and technical skills necessary to thrive in an ever-evolving, digital world.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="space-y-8 sm:space-y-10">
          <div className="text-center space-y-3 sm:space-y-4 px-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">Why Choose {settings?.school_name || 'GHS Kasala'}?</h2>
            <div className="w-16 sm:w-24 h-1 bg-amber-500 mx-auto rounded-full"></div>
            <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto">
              Equipped with experienced government faculty, disciplined learning environments, and strict academic standards designed for student success.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="group bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-2xl hover:shadow-teal-900/10 transition-all duration-300 hover:-translate-y-2 text-center sm:text-left">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto sm:mx-0 mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                <Users className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 mb-2 sm:mb-3">Qualified Faculty</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Highly trained SST, CT, PET, DM and AT teachers specializing in secondary education, dedicated to mentoring and academic growth.
              </p>
            </div>

            <div className="group bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-2xl hover:shadow-amber-900/10 transition-all duration-300 hover:-translate-y-2 text-center sm:text-left">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto sm:mx-0 mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                <Laptop className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 mb-2 sm:mb-3">Labs</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Modern, well-equipped laboratories offering hands-on practical experiments in Physics, Chemistry, and Biology to meet board examination standards.
              </p>
            </div>

            <div className="group bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-300 hover:-translate-y-2 text-center sm:text-left sm:col-span-2 md:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto sm:mx-0 mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <Award className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 mb-2 sm:mb-3">Digital DMC System</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Our innovative, database-driven digital mark-sheet lookup system allows students to instantly view, verify, and print official exam results.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default HomePage;