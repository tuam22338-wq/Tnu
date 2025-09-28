import React from 'react';
import { DownloadIcon, SparklesIcon, ArrowLeftIcon } from './Icons';

interface PreviewDisplayProps {
  fileName: string;
  fileSize: number;
  previewContent: string;
  onDownload: () => void;
  onAnalyze: () => void;
  onReset: () => void;
}

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export const PreviewDisplay: React.FC<PreviewDisplayProps> = ({ fileName, fileSize, previewContent, onDownload, onAnalyze, onReset }) => {

  return (
    <div className="w-full max-w-4xl flex flex-col items-center animate-fade-in">
        <div className="w-full flex items-center justify-between mb-4">
             <button onClick={onReset} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 rounded-md hover:bg-slate-700/50 transition-colors">
                <ArrowLeftIcon className="w-4 h-4" />
                Tải lên tệp khác
            </button>
            <div className="text-sm text-slate-400">
              {formatBytes(fileSize)}
            </div>
        </div>
        <div className="w-full p-6 bg-slate-900/50 rounded-xl border border-slate-800">
          <h2 className="text-2xl font-bold text-slate-100 mb-2 text-center">Chuyển đổi Thành công!</h2>
          <p className="text-slate-400 mb-6 text-center">Tệp <span className="font-bold text-cyan-400">{fileName}</span> đã được chuyển thành văn bản thuần túy.</p>
          
          <div className="w-full h-64 bg-slate-950 rounded-md p-4 text-left shadow-inner border border-slate-800 overflow-y-auto mb-8">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">{previewContent}</pre>
              { fileSize > previewContent.length && <div className="text-center text-slate-500 italic pt-2">... (xem trước được hiển thị, tệp đầy đủ sẽ được phân tích)</div> }
          </div>

          <p className="text-slate-300 mb-4 text-center font-semibold">Bạn muốn làm gì tiếp theo?</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                  onClick={onDownload}
                  className="flex items-center justify-center gap-3 px-8 py-3 bg-slate-700 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-slate-600 transition-all duration-300 transform hover:scale-105"
              >
                  <DownloadIcon className="w-6 h-6" />
                  Tải xuống .txt
              </button>
              <button
                  onClick={onAnalyze}
                  className="flex items-center justify-center gap-3 px-8 py-3 bg-cyan-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-400/50"
                  style={{ textShadow: 'var(--cyan-glow)' }}
              >
                  <SparklesIcon className="w-6 h-6" />
                  Tạo Đề Cương AI
              </button>
          </div>
        </div>
    </div>
  );
};