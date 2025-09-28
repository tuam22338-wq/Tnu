import React, { useState, useRef, useEffect } from 'react';
import { Status, Model, AnalysisMode, CharacterAnalysisData } from '../types';
import { Loader } from './Loader';
import { CharacterAnalysis } from './CharacterAnalysis';
import { BookOpenIcon, UsersIcon, SparklesIcon, DiagramIcon, ClipboardListIcon, DownloadIcon, ClipboardIcon, ChevronDownIcon, ArrowLeftIcon, UsersFocusIcon } from './Icons';

interface OutlineDisplayProps {
  status: Status;
  outline: string;
  fileName: string;
  modelName: Model;
  onReset: () => void;
  error: string | null;
  // Character Analysis props
  characterAnalysisData: CharacterAnalysisData | null;
  characterAnalysisStatus: Status;
  characterAnalysisError: string | null;
  onGenerateCharacterAnalysis: () => void;
}

const getIconForTitle = (title: string): React.ReactNode => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('tổng quan')) return <BookOpenIcon className="w-6 h-6 mr-3 text-cyan-400" />;
    if (lowerTitle.includes('nhân vật')) return <UsersIcon className="w-6 h-6 mr-3 text-cyan-400" />;
    if (lowerTitle.includes('chủ đề')) return <SparklesIcon className="w-6 h-6 mr-3 text-cyan-400" />;
    if (lowerTitle.includes('cấu trúc')) return <DiagramIcon className="w-6 h-6 mr-3 text-cyan-400" />;
    if (lowerTitle.includes('phân tích chi tiết')) return <ClipboardListIcon className="w-6 h-6 mr-3 text-cyan-400" />;
    return <BookOpenIcon className="w-6 h-6 mr-3 text-cyan-400" />;
};

const FormattedOutline: React.FC<{ text: string }> = ({ text }) => {
    const sections = text.split(/\n\s*\n(?=\d+\.\s+\*\*.*:\*\*)/);

    return (
        <div className="space-y-4 animate-fade-in">
            {sections.map((section, i) => {
                if (!section.trim()) return null;
                const lines = section.trim().split('\n');
                const titleLine = lines[0] || 'Section';
                const content = lines.slice(1).join('\n');
                const cleanTitle = titleLine.replace(/\d+\.\s+/, '').replace(/\*\*/g, '');

                return (
                    <details key={i} open className="bg-slate-900/50 rounded-lg group transition-all duration-300 border border-slate-800 hover:border-slate-700 overflow-hidden">
                        <summary className="font-bold text-lg text-slate-200 p-4 cursor-pointer flex justify-between items-center transition-colors hover:bg-slate-800/50 list-none">
                            <div className="flex items-center">
                                {getIconForTitle(cleanTitle)}
                                <span>{cleanTitle}</span>
                            </div>
                            <ChevronDownIcon className="w-5 h-5 transform transition-transform duration-300 group-open:rotate-180" />
                        </summary>
                        <div className="p-4 pt-2 border-t border-slate-800 text-slate-300 leading-relaxed prose prose-invert max-w-none prose-p:my-1 prose-li:my-1">
                             {content.trim().split('\n').map((line, index) => <p key={index}>{line}</p>)}
                        </div>
                    </details>
                );
            })}
        </div>
    );
};

export const OutlineDisplay: React.FC<OutlineDisplayProps> = (props) => {
  const { status, outline, fileName, modelName, onReset, error } = props;
  const [isCopied, setIsCopied] = useState(false);
  const [activeMode, setActiveMode] = useState<AnalysisMode>(AnalysisMode.OUTLINE);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const downloadButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (downloadButtonRef.current && !downloadButtonRef.current.contains(event.target as Node)) {
            setShowDownloadOptions(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDownload = () => {
    const blob = new Blob([outline], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    link.download = `${baseName}-de-cuong.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([outline], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    link.download = `${baseName}-de-cuong.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outline).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };
  
  const ActionBar = () => (
    <div className="sticky top-24 z-10 bg-slate-900/80 backdrop-blur-md rounded-xl p-3 mb-6 border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <button onClick={onReset} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 rounded-md hover:bg-slate-700/50 transition-colors">
                    <ArrowLeftIcon className="w-4 h-4" />
                    Bắt đầu lại
                </button>
            </div>
             <div className="flex-grow flex justify-center items-center gap-2 border-t sm:border-t-0 sm:border-x border-slate-700/50 py-2 sm:py-0 sm:px-4">
                <TabButton mode={AnalysisMode.OUTLINE} Icon={BookOpenIcon} label="Đề Cương" />
                <TabButton mode={AnalysisMode.CHARACTER_ANALYSIS} Icon={UsersFocusIcon} label="Nhân Vật" />
            </div>
            <div className="flex items-center justify-end gap-3">
                <div className="relative" ref={downloadButtonRef}>
                    <button 
                        onClick={() => setShowDownloadOptions(prev => !prev)} 
                        disabled={!outline || activeMode !== AnalysisMode.OUTLINE} 
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 rounded-md hover:bg-slate-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        Tải xuống
                        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${showDownloadOptions ? 'rotate-180' : ''}`} />
                    </button>
                    {showDownloadOptions && (
                        <div className="absolute right-0 mt-2 w-40 bg-slate-800 rounded-md shadow-lg z-20 border border-slate-700 animate-fade-in" style={{ animationDuration: '150ms' }}>
                            <ul className="py-1">
                                <li>
                                    <button 
                                        onClick={() => { handleDownload(); setShowDownloadOptions(false); }} 
                                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                                    >
                                      Đề cương (.md)
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        onClick={() => { handleDownloadTxt(); setShowDownloadOptions(false); }} 
                                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                                    >
                                      Đề cương (.txt)
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>

                <button onClick={handleCopy} disabled={!outline || activeMode !== AnalysisMode.OUTLINE} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 rounded-md hover:bg-slate-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <ClipboardIcon className="w-4 h-4" />
                    {isCopied ? 'Đã sao chép!' : 'Sao chép'}
                </button>
            </div>
        </div>
        <div className="text-center text-slate-400 text-xs mt-3 md:hidden">
            <p><span className="font-bold text-slate-200">{fileName}</span> - Mô hình: <span className="font-mono text-cyan-400">{modelName}</span></p>
        </div>
    </div>
  );

  const TabButton = ({mode, Icon, label}: {mode: AnalysisMode, Icon: React.FC<any>, label: string}) => (
    <button
        onClick={() => setActiveMode(mode)}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${activeMode === mode ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}`}
    >
        <Icon className="w-5 h-5" />
        {label}
    </button>
  );

  const renderOutlineContent = () => {
    switch (status) {
      case Status.PROCESSING:
        return (
          <div className="text-center">
            <Loader />
            <p className="mt-4 text-lg font-semibold text-cyan-400 animate-pulse">
              AI đang phân tích tiểu thuyết...
            </p>
            <p className="text-sm text-slate-400 mb-6">Quá trình này có thể mất vài phút. Dữ liệu sẽ xuất hiện ngay khi có.</p>
            <div className="w-full max-h-[40vh] overflow-y-auto bg-slate-950 rounded-md p-4 text-left shadow-inner border border-slate-800">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">{outline}</pre>
            </div>
          </div>
        );
      case Status.SUCCESS:
        return <FormattedOutline text={outline} />;
      case Status.ERROR:
         return (
            <div className="text-center text-red-400 bg-red-900/20 p-6 rounded-lg border border-red-800">
                <h3 className="text-xl font-bold mb-2">Đã xảy ra lỗi</h3>
                <p>{error}</p>
            </div>
         );
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (activeMode === AnalysisMode.OUTLINE) {
      return renderOutlineContent();
    }
    if (activeMode === AnalysisMode.CHARACTER_ANALYSIS) {
      return (
        <CharacterAnalysis 
          status={props.characterAnalysisStatus}
          data={props.characterAnalysisData}
          error={props.characterAnalysisError}
          onGenerate={props.onGenerateCharacterAnalysis}
        />
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-4xl">
      <ActionBar />
      <div className="w-full rounded-lg min-h-[40vh] transition-all duration-300">
        {renderContent()}
      </div>
    </div>
  );
};