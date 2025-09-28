import React, { useState, useEffect } from 'react';
import { Settings as AppSettings, Model } from '../types';
import { KeyIcon, CheckIcon } from './Icons';

interface SettingsProps {
  isVisible: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ isVisible, onClose, settings, onSettingsChange }) => {
  const [currentApiKey, setCurrentApiKey] = useState(settings.apiKey);
  const [currentModel, setCurrentModel] = useState(settings.model);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setCurrentApiKey(settings.apiKey);
    setCurrentModel(settings.model);
  }, [settings]);

  const handleSave = () => {
    onSettingsChange({ apiKey: currentApiKey, model: currentModel });
    setIsSaved(true);
    setTimeout(() => {
        setIsSaved(false);
        onClose();
    }, 1500);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-40" onClick={onClose}>
      <div 
        className="relative max-w-2xl mx-auto top-24 bg-slate-900 rounded-xl shadow-2xl p-6 border border-slate-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-cyan-400 mb-6">Cài Đặt</h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-slate-300 mb-2">
              Google AI API Key
            </label>
            <div className="relative">
              <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                id="api-key"
                value={currentApiKey}
                onChange={(e) => setCurrentApiKey(e.target.value)}
                placeholder="Nhập API Key của bạn tại đây"
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
             <p className="text-xs text-slate-500 mt-1">API Key được lưu trữ an toàn trong trình duyệt của bạn.</p>
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-slate-300 mb-2">
              Mô hình AI
            </label>
            <select
              id="model"
              value={currentModel}
              onChange={(e) => setCurrentModel(e.target.value as Model)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 px-3 py-2"
            >
              <option value={Model.GEMINI_2_5_FLASH}>Nhanh & Tối ưu (gemini-2.5-flash)</option>
              <option value={Model.GEMINI_1_5_PRO}>Chất lượng cao (gemini-1.5-pro)</option>
              <option value={Model.GEMINI_2_5_PRO}>Chất lượng cao nhất (gemini-2.5-pro)</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 text-slate-100 rounded-md hover:bg-slate-600 transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={handleSave}
            className={`px-6 py-2 rounded-md transition-all duration-300 flex items-center gap-2 ${isSaved ? 'bg-green-600' : 'bg-cyan-500 hover:bg-cyan-600'} text-white font-semibold`}
          >
            {isSaved ? (
                <>
                    <CheckIcon className="w-5 h-5"/> Đã lưu!
                </>
            ) : (
                'Lưu Cài Đặt'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};