'use client';

import { config } from '@/lib/config';

export function EnvironmentBanner() {
  if (config.isPreview) {
    return (
      <div className="bg-yellow-400 text-black p-2 text-center font-bold text-sm">
        ⚠️ TEST MODE - Using test payment keys
      </div>
    );
  }
  
  if (config.isDevelopment) {
    return (
      <div className="bg-blue-500 text-white p-2 text-center text-sm">
        🛠️ Development Environment
      </div>
    );
  }
  
  return null;
}