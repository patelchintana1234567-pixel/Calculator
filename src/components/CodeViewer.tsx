import React, { useState } from 'react';
import { ANDROID_FILES, AndroidCodeFile } from '../data/androidFiles';
import { Copy, Check, Download, FileCode, Search, ShieldCheck } from 'lucide-react';

interface CodeViewerProps {
  onDownloadZip: () => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ onDownloadZip }) => {
  const [selectedFileId, setSelectedFileId] = useState<string>('main-activity');
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentFile = ANDROID_FILES.find((f) => f.id === selectedFileId) || ANDROID_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = (file: AndroidCodeFile) => {
    const blob = new Blob([file.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename.split(' ')[0];
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Basic syntax coloring helper
  const renderHighlightedCode = (code: string, language: string) => {
    const lines = code.split('\n');
    return (
      <div className="font-mono text-xs leading-relaxed">
        {lines.map((line, idx) => {
          let lineContent: React.ReactNode = line;

          // Simple keyword coloring
          if (language === 'kotlin') {
            const isComment = line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*');
            if (isComment) {
              lineContent = <span className="text-slate-500 italic">{line}</span>;
            } else {
              // Highlight keywords
              lineContent = line
                .replace(
                  /\b(package|import|class|override|fun|val|var|private|public|companion object|const|return|if|else|when|try|catch|true|false|null|is|as|apply|let)\b/g,
                  '§kw§$1§end§'
                )
                .replace(/\b(String|Int|Double|Boolean|Context|Intent|DevicePolicyManager|ComponentName|UserManager|DeviceAdminReceiver|TextView|Button|View|Toast)\b/g, '§type§$1§end§')
                .replace(/(".*?")/g, '§str§$1§end§')
                .split(/(§kw§.*?§end§|§type§.*?§end§|§str§.*?§end§)/g)
                .map((segment, sIdx) => {
                  if (segment.startsWith('§kw§')) {
                    return <span key={sIdx} className="text-purple-400 font-semibold">{segment.replace(/§kw§|§end§/g, '')}</span>;
                  }
                  if (segment.startsWith('§type§')) {
                    return <span key={sIdx} className="text-amber-300">{segment.replace(/§type§|§end§/g, '')}</span>;
                  }
                  if (segment.startsWith('§str§')) {
                    return <span key={sIdx} className="text-emerald-400">{segment.replace(/§str§|§end§/g, '')}</span>;
                  }
                  return segment;
                });
            }
          } else if (language === 'xml') {
            const isComment = line.trim().startsWith('<!--');
            if (isComment) {
              lineContent = <span className="text-slate-500 italic">{line}</span>;
            } else {
              lineContent = line
                .replace(/(&lt;|<)(\/?[a-zA-Z0-9_-]+)/g, '§tag§$1$2§end§')
                .replace(/([a-zA-Z0-9_:-]+)=/g, '§attr§$1§end§=')
                .replace(/(".*?")/g, '§val§$1§end§')
                .split(/(§tag§.*?§end§|§attr§.*?§end§|§val§.*?§end§)/g)
                .map((segment, sIdx) => {
                  if (segment.startsWith('§tag§')) {
                    return <span key={sIdx} className="text-sky-400 font-semibold">{segment.replace(/§tag§|§end§/g, '')}</span>;
                  }
                  if (segment.startsWith('§attr§')) {
                    return <span key={sIdx} className="text-indigo-300">{segment.replace(/§attr§|§end§/g, '')}</span>;
                  }
                  if (segment.startsWith('§val§')) {
                    return <span key={sIdx} className="text-amber-300">{segment.replace(/§val§|§end§/g, '')}</span>;
                  }
                  return segment;
                });
            }
          }

          return (
            <div key={idx} className="flex hover:bg-slate-800/40 px-3 py-0.5 group">
              <span className="w-10 select-none text-right pr-4 text-slate-600 font-mono text-[11px] tabular-nums">
                {idx + 1}
              </span>
              <span className="flex-1 whitespace-pre text-slate-200">{lineContent}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const filteredFiles = ANDROID_FILES.filter(
    (f) =>
      f.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* File Navigation Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {ANDROID_FILES.map((file) => {
            const isSelected = file.id === currentFile.id;
            return (
              <button
                key={file.id}
                onClick={() => setSelectedFileId(file.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{file.filename}</span>
                {file.required && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Core Requirement" />
                )}
              </button>
            );
          })}
        </div>

        {/* Global Zip Download */}
        <button
          onClick={onDownloadZip}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all rounded-lg border border-slate-700 whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" />
          <span>Export Android Project (.ZIP)</span>
        </button>
      </div>

      {/* File Meta Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-400 truncate">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-mono text-slate-300 font-medium truncate">{currentFile.path}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 hidden sm:inline">{currentFile.description}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleDownloadSingle(currentFile)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Download this file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-all ${
              copied
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Viewer Body */}
      <div className="flex-1 overflow-auto bg-[#0B0F19] py-3">
        {renderHighlightedCode(currentFile.code, currentFile.language)}
      </div>
    </div>
  );
};
