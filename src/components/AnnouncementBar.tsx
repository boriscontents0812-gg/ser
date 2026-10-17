import React from 'react';
import { storeConfig } from '../config/storeConfig';

export const AnnouncementBar: React.FC = () => {
  if (!storeConfig.brand.showAnnouncement || !storeConfig.brand.announcement) {
    return null;
  }

  return (
    <aside 
      aria-label="Announcement"
      className="bg-[#EAEFF4] border-b border-[#D6DCE1] text-xs text-[#304F67] py-2.5 px-4 text-center tracking-wide font-medium"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3898D5]"></span>
        <span className="text-[#14334D] font-semibold">{storeConfig.brand.announcement}</span>
      </div>
    </aside>
  );
};
