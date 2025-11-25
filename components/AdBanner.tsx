import React from 'react';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
}

export const AdBanner: React.FC<AdBannerProps> = ({ slot, format = 'auto' }) => {
  // In a real production app, this would contain the actual Google AdSense script logic.
  // For this prototype, we display a visual placeholder indicating where ads generate revenue.
  return (
    <div className="w-full my-6 bg-gray-100 border border-gray-200 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 text-sm h-32">
      <span className="font-semibold uppercase tracking-wider mb-1">Sponsored</span>
      <span>Ad Space (Slot: {slot})</span>
      <span className="text-xs text-gray-300 mt-2">High-value Fintech Ads / Partner Deals</span>
    </div>
  );
};