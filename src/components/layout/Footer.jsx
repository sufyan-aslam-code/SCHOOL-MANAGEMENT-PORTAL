import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Award,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { settings } = useSettings();

  // Check if at least one social media link exists in the database
  const hasSocialLinks = 
    settings?.facebook_url || 
    settings?.twitter_url || 
    settings?.instagram_url || 
    settings?.youtube_url;

  return (
    <footer className="bg-slate-900 text-slate-300 border-t-4 border-teal-600">
      {/* Upper Footer: School Info & Quick Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">

        {/* Column 1: Branding, Summary & Socials */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-700 to-emerald-900 flex items-center justify-center text-amber-400 shadow-lg flex-shrink-0">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="font-bold text-white text-base leading-tight">
                {settings?.school_name || 'Government High School Kasala'}
              </div>
              <div className="text-xs text-amber-400 font-semibold mt-0.5">
                EMIS: {settings?.emis_code || 'Loading...'}
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
            {settings?.school_name || 'Government High School Kasala'} is a premier secondary public institution located in District {settings?.district || 'Abbottabad'}, {settings?.province || 'Khyber Pakhtunkhwa'}, dedicated to academic excellence, character building, and digital governance.
          </p>
          <div className="pt-2">
            <Link
              to="/results"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <Award className="w-4 h-4" />
              <span>Online Result Portal</span>
            </Link>
          </div>

          {/* Dynamic Social Media Section */}
          {hasSocialLinks && (
            <div className="pt-4 mt-4 border-t border-slate-800">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                Connect With Us
              </h3>
              <div className="flex gap-2.5">
                {settings?.facebook_url && (
                  <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-colors" title="Facebook">
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {settings?.twitter_url && (
                  <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white transition-colors" title="Twitter/X">
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {settings?.instagram_url && (
                  <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-pink-600 hover:text-white transition-colors" title="Instagram">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {settings?.youtube_url && (
                  <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white transition-colors" title="YouTube">
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            Quick Navigation
          </h3>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            {[
              { name: 'Home', path: '/' },
              { name: 'About School', path: '/about' },
              { name: 'Faculty & Teachers', path: '/faculty' },
              { name: 'Check DMC Results', path: '/results' },
              { name: 'Contact & Location', path: '/contact' },
              { name: 'Admin Portal Login', path: '/admin/login' },
            ].map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1.5 group py-0.5"
                >
                  <ChevronRight className="w-3 h-3 text-teal-500 group-hover:translate-x-1 transition-transform" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Dynamic School Timings & Schedule */}
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            School Schedule
          </h3>
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
              <div>
                <strong className="text-slate-200 block text-xs">Summer Timings:</strong>
                <span className="text-slate-400 text-xs">{settings?.summer_timings || '07:30 AM - 01:30 PM (Mon - Sat)'}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
              <div>
                <strong className="text-slate-200 block text-xs">Winter Timings:</strong>
                <span className="text-slate-400 text-xs">{settings?.winter_timings || '08:30 AM - 02:00 PM (Mon - Sat)'}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 pt-1">
              <ShieldAlert className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <strong className="text-slate-200 block text-xs">Friday Hours:</strong>
                <span className="text-slate-400 text-xs">{settings?.friday_hours || 'Closing early at 12:00 PM'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 4: Contact Information */}
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            Contact Information
          </h3>
          <ul className="space-y-3 text-xs sm:text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
              <span className="text-slate-400 leading-normal text-xs">{settings?.location_address || 'Abbottabad, Khyber Pakhtunkhwa'}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-teal-400 shrink-0" />
              <a href={`tel:${settings?.phone || ''}`} className="hover:text-amber-400 transition-colors text-xs">
                {settings?.phone || '+92 992 000000'}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-teal-400 shrink-0" />
              <a href={`mailto:${settings?.email || ''}`} className="hover:text-amber-400 transition-colors text-xs truncate">
                {settings?.email || 'info@ghskasala.edu.pk'}
              </a>
            </li>
            <li className="pt-2">
              <a
                href="https://kpese.gov.pk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-teal-400 hover:text-amber-400 transition-colors font-medium text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50 w-full justify-center sm:justify-start"
              >
                <span>KP Elementary & Secondary Education</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar: Copyright */}
      <div className="bg-slate-950 text-slate-500 text-xs py-5 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left">
          <div>
            &copy; {currentYear} <strong className="text-slate-400">{settings?.school_name || 'Government High School Kasala'}</strong>. All rights reserved.
          </div>
          <div className="text-slate-600 font-medium text-[11px] sm:text-xs">
            Elementary & Secondary Education Department, Govt of {settings?.province || 'KP'}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;