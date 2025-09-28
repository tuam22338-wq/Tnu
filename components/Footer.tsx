import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} TAM THIÊN THẾ GIỚI - MOD TOOL. Phát triển bởi NGUYEN HOANG TRUONG.</p>
        <p className="text-sm mt-1">Hỗ trợ bởi Google Gemini</p>
      </div>
    </footer>
  );
};