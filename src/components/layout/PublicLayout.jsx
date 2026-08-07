import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

// Import the popup component 
// Note: Depending on exactly where PublicLayout.jsx is saved, you may need 
// to adjust the '../' to match your folder structure (e.g., './LatestNoticePopup' if they are in the same folder)
import { LatestNoticePopup } from '../../pages/public/LatestNoticePopup';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      
      {/* The pop-up will now mount on every public page load */}
      <LatestNoticePopup />

      <main className="flex-grow">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};

export default PublicLayout;