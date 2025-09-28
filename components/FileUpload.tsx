import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon } from './Icons';
import { Loader } from './Loader';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  isConverting: boolean;
  error: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, isConverting, error }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((selectedFile: File | null) => {
    if (isConverting) return;
    onFileChange(selectedFile);
  }, [onFileChange, isConverting]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    handleFile(file);
    event.target.value = ''; // Allow re-uploading the same file
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isConverting) setIsDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (isConverting) return;
    const droppedFile = e.dataTransfer.files ? e.dataTransfer.files[0] : null;
    handleFile(droppedFile);
  };

  const handleClick = () => {
    if (isConverting) return;
    inputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl text-center flex flex-col items-center">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">TAM THIÊN THẾ GIỚI - MOD TOOL</h2>
      <p className="text-slate-400 mb-8 max-w-lg">Tải lên tệp để chuyển đổi sang văn bản thuần túy. Sau đó, bạn có thể tải xuống hoặc để AI tạo đề cương chi tiết.</p>
      
      <div 
        className={`relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl transition-all duration-300 ${isDragOver ? 'border-cyan-400 bg-slate-800/50' : 'border-slate-700 bg-slate-900/50'} ${isConverting ? 'cursor-wait' : 'cursor-pointer hover:border-cyan-500'}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center justify-center">
          {isConverting ? (
            <Loader />
          ) : (
            <UploadIcon className="w-12 h-12 mb-4 text-slate-500" />
          )}

          <p className="mb-2 text-lg text-slate-300">
            {isConverting ? (
              <span className="font-semibold text-cyan-400 animate-pulse">Đang xử lý tệp...</span>
            ) : (
              <><span className="font-semibold text-cyan-400">Nhấn để tải lên</span> hoặc kéo thả tệp</>
            )}
          </p>
          <p className="text-sm text-slate-500">Hỗ trợ: .txt, .pdf, .docx, .md</p>
        </div>
        <input 
          id="file-upload" 
          ref={inputRef} 
          type="file" 
          className="hidden" 
          accept=".txt,.pdf,.md,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
          onChange={handleChange} 
          disabled={isConverting}
        />
      </div>

      {error && <p className="text-red-400 mt-4">{error}</p>}
    </div>
  );
};