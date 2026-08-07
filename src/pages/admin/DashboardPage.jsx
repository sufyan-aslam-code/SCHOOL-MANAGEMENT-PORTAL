import React from 'react';
import { useSearchParams } from 'react-router-dom';

// Components
import { OverviewTab } from "../../components/admin/OverviewTab";
import { StudentsTab } from "../../components/admin/StudentsTab";
import { ResultsTab } from "../../components/admin/ResultsTab";
import { FacultyTab } from "../../components/admin/FacultyTab";
import { SettingsTab } from "../../components/admin/SettingsTab";
import { GalleryTab } from "../../components/admin/GalleryTab";
import { AnnouncementsTab } from "../../components/admin/AnnouncementsTab";

import { useSettings } from '../../hooks/useSettings';

export const DashboardPage = () => {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  // Fetch settings dynamically from the database
  const { settings } = useSettings();

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Management Console</h1>
          <p className="text-xs text-slate-500">Manage students, upload results, update faculty, and publish notices.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-teal-50 text-teal-800 font-bold px-3 py-1.5 rounded-lg border border-teal-200">
            EMIS: {settings?.emis_code || 'Loading...'}
          </span>
        </div>
      </div>

      {/* Tab Switcher Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">

        {/* Render Tab Components based on URL parameter */}
        {currentTab === 'overview' && <OverviewTab />}
        {currentTab === 'students' && <StudentsTab />}
        {currentTab === 'results' && <ResultsTab />}
        {currentTab === 'faculty' && <FacultyTab />}
        {currentTab === 'settings' && <SettingsTab />}
        {currentTab === 'gallery' && <GalleryTab />}
        {currentTab === 'announcements' && <AnnouncementsTab />}


      </div>
    </div>
  );
};

export default DashboardPage;