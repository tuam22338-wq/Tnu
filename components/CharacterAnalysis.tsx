import React from 'react';
import { Status, CharacterAnalysisData } from '../types';
import { Loader } from './Loader';
import { UsersFocusIcon, TimelineIcon, HeartHandshakeIcon, QuoteIcon, ChevronDownIcon, UsersIcon } from './Icons';

interface CharacterAnalysisProps {
  status: Status;
  data: CharacterAnalysisData | null;
  error: string | null;
  onGenerate: () => void;
}

const CharacterCard: React.FC<{ profile: CharacterAnalysisData[0] }> = ({ profile }) => {
    return (
        <details open className="bg-slate-900/50 rounded-lg group transition-all duration-300 border border-slate-800 hover:border-slate-700 overflow-hidden">
            <summary className="font-bold text-lg text-slate-200 p-4 cursor-pointer flex justify-between items-center transition-colors hover:bg-slate-800/50 list-none">
                <div className="flex items-center">
                    <UsersIcon className="w-6 h-6 mr-3 text-cyan-400" />
                    <span>{profile.name} - <span className="font-normal text-slate-400">{profile.role}</span></span>
                </div>
                <ChevronDownIcon className="w-5 h-5 transform transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <div className="p-4 pt-2 border-t border-slate-800 text-slate-300 leading-relaxed space-y-4">
                <p className="italic text-slate-400">{profile.description}</p>
                
                <div>
                    <h4 className="flex items-center font-semibold text-cyan-400 mb-2"><TimelineIcon className="w-5 h-5 mr-2"/>Hành trình Nhân vật</h4>
                    <div className="pl-4 border-l-2 border-slate-700 space-y-2 text-sm">
                        <p><strong>Bắt đầu:</strong> {profile.arc.beginning}</p>
                        <p><strong>Giữa:</strong> {profile.arc.middle}</p>
                        <p><strong>Kết thúc:</strong> {profile.arc.end}</p>
                    </div>
                </div>

                {profile.relationships.length > 0 && (
                    <div>
                        <h4 className="flex items-center font-semibold text-cyan-400 mb-2"><HeartHandshakeIcon className="w-5 h-5 mr-2"/>Mối quan hệ</h4>
                        <ul className="pl-4 list-disc list-inside text-sm">
                            {profile.relationships.map((rel, i) => (
                                <li key={i}><strong>{rel.characterName}:</strong> {rel.relationship}</li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {profile.keyQuotes.length > 0 && (
                     <div>
                        <h4 className="flex items-center font-semibold text-cyan-400 mb-2"><QuoteIcon className="w-5 h-5 mr-2"/>Lời thoại Tiêu biểu</h4>
                        <div className="pl-4 space-y-2 text-sm italic">
                            {profile.keyQuotes.map((quote, i) => (
                                <blockquote key={i} className="border-l-2 border-cyan-500 pl-3">"{quote}"</blockquote>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </details>
    );
};

export const CharacterAnalysis: React.FC<CharacterAnalysisProps> = ({ status, data, error, onGenerate }) => {
    if (status === Status.ERROR) {
        return (
            <div className="text-center text-red-400 bg-red-900/20 p-6 rounded-lg border border-red-800 animate-fade-in">
                <h3 className="text-xl font-bold mb-2">Đã xảy ra lỗi</h3>
                <p>{error}</p>
                 <button 
                    onClick={onGenerate}
                    className="mt-4 px-4 py-2 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600 transition-colors"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    if (status === Status.SUCCESS && data) {
         return (
            <div className="space-y-4 animate-fade-in">
                {data.map((profile, i) => (
                    <CharacterCard key={i} profile={profile} />
                ))}
            </div>
        );
    }

    // Fix: Refactored to combine IDLE and PROCESSING states to resolve TypeScript error and improve UI.
    return (
        <div className="text-center flex flex-col items-center justify-center min-h-[40vh] animate-fade-in">
            {status === Status.PROCESSING ? (
                <>
                    <Loader />
                    <p className="mt-4 text-lg font-semibold text-cyan-400 animate-pulse">
                        AI đang phân tích chuyên sâu các nhân vật...
                    </p>
                    <p className="text-sm text-slate-400">Quá trình này có thể mất một chút thời gian, xin hãy kiên nhẫn.</p>
                </>
            ) : (
                <>
                    <UsersFocusIcon className="w-16 h-16 mb-4 text-slate-600" />
                    <h3 className="text-2xl font-bold text-slate-200">Phân tích Nhân vật Chuyên sâu</h3>
                    <p className="text-slate-400 mt-2 max-w-md">
                        Kích hoạt chế độ này để AI đọc và phân tích sâu về các nhân vật chính, bao gồm hành trình phát triển, mối quan hệ và các chi tiết quan trọng khác.
                    </p>
                </>
            )}
            <button
                onClick={onGenerate}
                disabled={status === Status.PROCESSING}
                className="mt-6 px-8 py-3 bg-cyan-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                style={{ textShadow: 'var(--cyan-glow)' }}
            >
                {status === Status.PROCESSING ? 'Đang phân tích...' : 'Bắt đầu Phân tích Nhân vật'}
            </button>
        </div>
    );
};
