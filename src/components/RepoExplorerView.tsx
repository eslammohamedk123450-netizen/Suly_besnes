import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FileCode, 
  FileText, 
  GitBranch, 
  GitCommit, 
  RefreshCw, 
  Lock, 
  Globe, 
  Download, 
  ExternalLink,
  Code2,
  FileCheck,
  Search,
  UploadCloud,
  ChevronRight,
  Eye
} from 'lucide-react';
import { GitHubService } from '../services/githubService';
import { GitHubRepo, GitHubTreeItem, GitHubCommit } from '../types';

interface RepoExplorerViewProps {
  currentRepoName: string;
  token: string;
  repos: GitHubRepo[];
  onSelectRepo: (name: string) => void;
  onOpenConnectModal: () => void;
}

export const RepoExplorerView: React.FC<RepoExplorerViewProps> = ({
  currentRepoName,
  token,
  repos,
  onSelectRepo,
  onOpenConnectModal,
}) => {
  const [treeItems, setTreeItems] = useState<GitHubTreeItem[]>([]);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'commits'>('files');

  const currentRepo = repos.find(r => r.name.toLowerCase() === currentRepoName.toLowerCase());

  useEffect(() => {
    loadRepoData(currentRepoName);
  }, [currentRepoName, token]);

  const loadRepoData = async (repoName: string) => {
    setIsLoadingTree(true);
    setErrorMsg(null);
    setSelectedFile(null);
    setFileContent('');

    try {
      // 1. Fetch file tree
      const tree = await GitHubService.getRepoTree('eslammohamedk123450-netizen', repoName, 'main', token || undefined);
      setTreeItems(tree);

      // Auto-select README or index.html if available
      const defaultFile = tree.find(f => f.path.toLowerCase() === 'readme.md') || tree.find(f => f.path.endsWith('.html') || f.path.endsWith('.json') || f.path.endsWith('.ts'));
      if (defaultFile && defaultFile.type === 'blob') {
        loadFile(repoName, defaultFile.path);
      }

      // 2. Fetch commits
      const commitList = await GitHubService.getRecentCommits('eslammohamedk123450-netizen', repoName, token || undefined);
      setCommits(commitList);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      setTreeItems([]);
      setCommits([]);
    } finally {
      setIsLoadingTree(false);
    }
  };

  const loadFile = async (repoName: string, path: string) => {
    setSelectedFile(path);
    setIsLoadingFile(true);
    try {
      const content = await GitHubService.getFileContent('eslammohamedk123450-netizen', repoName, path, token || undefined);
      setFileContent(content);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFileContent(`// تعذر تحميل الملف: ${msg}`);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const filteredTree = treeItems.filter(item => 
    item.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5" dir="rtl">
      {/* Top Bar / Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                مستكشف كود المستودع (GitHub Code Explorer)
              </h2>
              {currentRepo?.private ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  مستودع خاص Private
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" />
                  مستودع عام Public
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              eslammohamedk123450-netizen / <span className="text-emerald-400 font-bold">{currentRepoName}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Repo Selector Dropdown */}
          <select
            value={currentRepoName}
            onChange={(e) => onSelectRepo(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 font-mono"
          >
            {repos.map(r => (
              <option key={r.id} value={r.name}>
                {r.name} {r.private ? '🔒' : '🌐'}
              </option>
            ))}
            {!repos.some(r => r.name.toLowerCase() === 'suly_besnes') && (
              <option value="Suly_besnes">Suly_besnes 🔒 (مستودع خاص)</option>
            )}
          </select>

          <button
            onClick={() => loadRepoData(currentRepoName)}
            disabled={isLoadingTree}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="إعادة تحميل ملفات المستودع"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingTree ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onOpenConnectModal}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-950/30"
          >
            <Lock className="w-3.5 h-3.5" />
            إدارة رمز الوصول (PAT)
          </button>
        </div>
      </div>

      {/* Error Banner if repo cannot be accessed */}
      {errorMsg && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs space-y-2">
          <p className="font-semibold text-rose-200">
            تعذر الوصول التلقائي إلى المستودع: {currentRepoName}
          </p>
          <p className="text-rose-300/90 leading-relaxed">
            {errorMsg}. في حال كان المستودع خاصاً (Private)، تأكد من إدخال GitHub Personal Access Token بصلاحية <code className="bg-rose-950/80 px-1 py-0.5 rounded text-white">repo</code> عبر النقر على زر "إدارة رمز الوصول (PAT)" بالأعلى.
          </p>
          <div className="pt-1">
            <button
              onClick={onOpenConnectModal}
              className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-medium"
            >
              إدخال رمز الدخول الآن
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: File Tree + Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[550px]">
        {/* Left Column: Explorer Tree & Commits */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
          {/* Tabs header */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1">
            <button
              onClick={() => setActiveTab('files')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'files'
                  ? 'bg-slate-800 text-emerald-400 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              الملفات ({treeItems.length})
            </button>
            <button
              onClick={() => setActiveTab('commits')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'commits'
                  ? 'bg-slate-800 text-emerald-400 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              التعديلات ({commits.length})
            </button>
          </div>

          {activeTab === 'files' ? (
            <div className="flex-1 flex flex-col p-3 space-y-2 overflow-hidden">
              {/* Search file */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث في ملفات الكود..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-8 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Tree list */}
              <div className="flex-1 overflow-y-auto space-y-1 max-h-[480px] pr-1">
                {isLoadingTree ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
                    <span>جاري جلب شجرة المستودع...</span>
                  </div>
                ) : filteredTree.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 text-xs">
                    {errorMsg ? 'لا توجد ملفات للعرض' : 'لم يتم العثور على ملفات'}
                  </div>
                ) : (
                  filteredTree.map((item) => {
                    const isSelected = selectedFile === item.path;
                    const isBlob = item.type === 'blob';
                    return (
                      <button
                        key={item.sha + item.path}
                        onClick={() => isBlob && loadFile(currentRepoName, item.path)}
                        disabled={!isBlob}
                        className={`w-full text-right p-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40 font-semibold'
                            : isBlob
                            ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                            : 'text-slate-500 opacity-80 cursor-default'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isBlob ? (
                            item.path.endsWith('.json') || item.path.endsWith('.ts') || item.path.endsWith('.js') ? (
                              <FileCode className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )
                          ) : (
                            <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          )}
                          <span className="truncate">{item.path}</span>
                        </div>
                        {item.size && (
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {(item.size / 1024).toFixed(1)}k
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Commits Tab */
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[520px]">
              {commits.length === 0 ? (
                <div className="py-10 text-center text-slate-500 text-xs">
                  لا توجد سجلات تعديل متاحة
                </div>
              ) : (
                commits.map((c) => (
                  <div
                    key={c.sha}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-right space-y-1"
                  >
                    <p className="text-xs font-medium text-slate-200 line-clamp-2">
                      {c.commit.message}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{c.commit.author.name}</span>
                      <span>{c.sha.slice(0, 7)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Column: Code / File Viewer */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
          {/* File Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white font-mono">
                {selectedFile || 'اختر ملفاً لمعاينة محتواه'}
              </span>
            </div>
            {selectedFile && (
              <div className="flex items-center gap-2">
                <a
                  href={`https://github.com/eslammohamedk123450-netizen/${currentRepoName}/blob/main/${selectedFile}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700"
                >
                  عرض في GitHub
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Code Viewer Container */}
          <div className="flex-1 bg-slate-950/90 p-4 overflow-auto font-mono text-xs leading-relaxed text-slate-200 max-h-[580px]">
            {isLoadingFile ? (
              <div className="h-full py-20 flex flex-col items-center justify-center text-slate-500 gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
                <span>جاري قراءة الملف...</span>
              </div>
            ) : selectedFile ? (
              <pre className="whitespace-pre-wrap break-words text-slate-300 select-text">
                {fileContent}
              </pre>
            ) : (
              <div className="h-full py-28 flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
                  <FileText className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-300">مستعرض ملفات كود Suly</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    اختر أي ملف من القائمة الجانبية لقراءة محتواه وفحص بنيته البرمجية مباشرة من GitHub
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
