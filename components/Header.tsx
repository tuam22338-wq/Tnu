import React from 'react';
import { BrainCircuitIcon, SettingsIcon } from './Icons';

interface HeaderProps {
    onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="bg-slate-950/70 backdrop-blur-sm sticky top-0 z-30 border-b border-slate-800/50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <BrainCircuitIcon className="w-9 h-9 text-cyan-400" />
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-wider">
              TAM THIÊN THẾ GIỚI <span className="font-normal text-cyan-400 opacity-80">- MOD TOOL</span>
            </h1>
        </div>
        <button 
            onClick={onSettingsClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 rounded-md hover:bg-slate-700/50 transition-colors border border-slate-700/50 hover:border-cyan-500"
            aria-label="Mở cài đặt"
        >
            <SettingsIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Cài Đặt</span>
        </button>
      </div>
    </header>
  );
};