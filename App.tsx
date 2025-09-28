import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FileUpload } from './components/FileUpload';
import { PreviewDisplay } from './components/PreviewDisplay';
import { OutlineDisplay } from './components/OutlineDisplay';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Settings } from './components/Settings';
import { generateOutlineChatStream, generateCharacterAnalysisChat } from './services/geminiService';
import { Status, Model, Settings as AppSettings, CharacterAnalysisData } from './types';

// Let TypeScript know about the globals from the script tags
declare const pdfjsLib: any;
declare const mammoth: any;

enum AppState {
  IDLE,
  CONVERTING,
  PREVIEW,
  ANALYZING,
  RESULTS
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const fileContentRef = useRef<string>('');
  const [outline, setOutline] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [conversionProgress, setConversionProgress] = useState<number | null>(null);
  
  const [characterAnalysisStatus, setCharacterAnalysisStatus] = useState<Status>(Status.IDLE);
  const [characterAnalysisData, setCharacterAnalysisData] = useState<CharacterAnalysisData | null>(null);
  const [characterAnalysisError, setCharacterAnalysisError] = useState<string | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: '',
    model: Model.GEMINI_2_5_FLASH,
  });

  useEffect(() => {
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;
    }
  }, []);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('appSettings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(parsedSettings);
        if (!parsedSettings.apiKey) {
          setShowSettings(true);
        }
      } else {
        setShowSettings(true);
      }
    } catch (e) {
      console.error("Failed to load settings from localStorage", e);
      setShowSettings(true);
    }
  }, []);

  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
    } catch(e) {
      console.error("Failed to save settings to localStorage", e);
    }
  };
  
  const convertPdfToTxt = async (pdfFile: File, onProgress: (progress: number) => void): Promise<string> => {
    onProgress(0);
    const arrayBuffer = await pdfFile.arrayBuffer();
    onProgress(5); // File loaded into memory
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    onProgress(10); // PDF document parsed
    
    const numPages = pdf.numPages;
    const pageTexts = new Array(numPages);
    let pagesProcessed = 0;

    const pagePromises = Array.from({ length: numPages }, (_, i) => {
        return pdf.getPage(i + 1).then((page: any) => {
            return page.getTextContent().then((textContent: any) => {
                pageTexts[i] = textContent.items.map((item: any) => item.str).join(' ');
                pagesProcessed++;
                const progress = 10 + Math.round((pagesProcessed / numPages) * 90);
                onProgress(progress);
            });
        });
    });

    await Promise.all(pagePromises);
    const fullText = pageTexts.join('\n\n');

    if (!fullText.trim()) throw new Error('Không tìm thấy nội dung văn bản trong tệp PDF.');
    return fullText;
  };

  const convertDocxToTxt = async (docxFile: File): Promise<string> => {
    const arrayBuffer = await docxFile.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const handleFileChange = async (selectedFile: File | null) => {
    if (!selectedFile) return;
    
    handleReset(); // Clear previous state
    setFile(selectedFile);
    setAppState(AppState.CONVERTING);
    setError(null);
    setConversionProgress(null);

    try {
      let textContent = '';
      const fileName = selectedFile.name.toLowerCase();

      if (fileName.endsWith('.pdf')) {
        textContent = await convertPdfToTxt(selectedFile, setConversionProgress);
      } else if (fileName.endsWith('.docx')) {
        textContent = await convertDocxToTxt(selectedFile);
      } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
        textContent = await selectedFile.text();
      } else {
        // Best-effort for other file types, may not work for binary files.
        throw new Error(`Định dạng tệp không được hỗ trợ. Vui lòng thử .txt, .pdf, hoặc .docx.`);
      }
      fileContentRef.current = textContent;
      setFilePreview(textContent.slice(0, 5000));
      setAppState(AppState.PREVIEW);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xử lý tệp.');
      setAppState(AppState.IDLE);
      setConversionProgress(null);
    }
  };

  const handleStartAnalysis = useCallback(async () => {
    if (!fileContentRef.current) {
      setError('Không có nội dung để phân tích.');
      setAppState(AppState.PREVIEW);
      return;
    }
    if (!settings.apiKey) {
      setError('Vui lòng nhập API Key của bạn trong phần Cài Đặt để bắt đầu.');
      setShowSettings(true);
      setAppState(AppState.PREVIEW);
      return;
    }

    setAppState(AppState.ANALYZING);
    setOutline('');
    setError(null);
    setCharacterAnalysisData(null);
    setCharacterAnalysisStatus(Status.IDLE);
    setCharacterAnalysisError(null);

    try {
      await generateOutlineChatStream(
        fileContentRef.current,
        settings.apiKey,
        settings.model,
        (chunk) => setOutline((prev) => prev + chunk)
      );
      setAppState(AppState.RESULTS);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định trong quá trình xử lý.');
      setAppState(AppState.RESULTS); // Go to results view to show the error
    }
  }, [settings]);
  
  const handleGenerateCharacterAnalysis = useCallback(async () => {
    if (!fileContentRef.current) {
        setCharacterAnalysisError("Không tìm thấy nội dung tệp để phân tích.");
        setCharacterAnalysisStatus(Status.ERROR);
        return;
    }
    setCharacterAnalysisStatus(Status.PROCESSING);
    setCharacterAnalysisError(null);
    try {
        const data = await generateCharacterAnalysisChat(fileContentRef.current, settings.apiKey, settings.model);
        setCharacterAnalysisData(data);
        setCharacterAnalysisStatus(Status.SUCCESS);
    } catch (err) {
        setCharacterAnalysisError(err instanceof Error ? err.message : 'Lỗi không xác định.');
        setCharacterAnalysisStatus(Status.ERROR);
    }
  }, [settings]);

  const handleDownloadTxt = () => {
    if (!fileContentRef.current || !file) return;
    const blob = new Blob([fileContentRef.current], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    link.download = `${baseName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setFile(null);
    setFilePreview('');
    fileContentRef.current = '';
    setOutline('');
    setError(null);
    setCharacterAnalysisData(null);
    setCharacterAnalysisStatus(Status.IDLE);
    setCharacterAnalysisError(null);
    setConversionProgress(null);
  };

  const renderMainContent = () => {
      switch (appState) {
          case AppState.IDLE:
          case AppState.CONVERTING:
              return (
                  <FileUpload
                      onFileChange={handleFileChange}
                      isConverting={appState === AppState.CONVERTING}
                      error={error}
                      progress={conversionProgress}
                  />
              );
          case AppState.PREVIEW:
              return (
                  <PreviewDisplay
                      fileName={file?.name || ''}
                      fileSize={file?.size || 0}
                      previewContent={filePreview}
                      onDownload={handleDownloadTxt}
                      onAnalyze={handleStartAnalysis}
                      onReset={handleReset}
                  />
              );
          case AppState.ANALYZING:
          case AppState.RESULTS:
              const outlineStatus = appState === AppState.ANALYZING ? Status.PROCESSING : (error ? Status.ERROR : Status.SUCCESS);
              return (
                  <OutlineDisplay 
                      status={outlineStatus} 
                      outline={outline} 
                      fileName={file?.name || ''} 
                      modelName={settings.model}
                      onReset={handleReset} 
                      error={error}
                      characterAnalysisData={characterAnalysisData}
                      characterAnalysisStatus={characterAnalysisStatus}
                      characterAnalysisError={characterAnalysisError}
                      onGenerateCharacterAnalysis={handleGenerateCharacterAnalysis}
                  />
              );
          default:
              return null;
      }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header onSettingsClick={() => setShowSettings(!showSettings)} />
      
      <main className="flex-grow flex flex-col items-center justify-center container mx-auto p-4 md:p-8">
        <Settings 
          isVisible={showSettings} 
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />
        {renderMainContent()}
      </main>
      
      <Footer />
    </div>
  );
};

export default App;