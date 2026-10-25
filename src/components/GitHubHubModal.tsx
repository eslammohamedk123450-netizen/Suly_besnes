import React, { useState, useEffect } from 'react';
import { 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Lock, 
  Globe, 
  RefreshCw, 
  FolderGit2, 
  Search,
  ShieldCheck,
  ChevronLeft,
  X,
  Copy,
  Check,
  Layers
} from 'lucide-react';
import { GitHubService } from '../services/githubService';
import { GitHubUser, GitHubRepo } from '../types';

interface GitHubHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onSaveToken: (token: string) => void;
  currentUser: GitHubUser | null;
  repos: GitHubRepo[];
  onSelectRepo: (repoName: string) => void;
  selectedRepoName: string;
  onRefreshRepos: () => void;
  isLoadingRepos: boolean;
}

export const GitHubHubModal: React.FC<GitHubHubModalProps> = ({
  isOpen,
  onClose,
  token,
  onSaveToken,
  currentUser,
  repos,
  onSelectRepo,
  selectedRepoName,
  onRefreshRepos,
  isLoadingRepos,
}) => {
  const [inputToken, setInputToken] = useState(token);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [repoSearch, setRepoSearch] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    setInputToken(token);
  }, [token]);

  if (!isOpen) return null;

  const handleVerifyAndSave = async () => {
    if (!inputToken.trim()) {
      setErrorMsg('يرجى كتابة أو لصق رمز GitHub Personal Access Token');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const user = await GitHubService.getAuthenticatedUser(inputToken.trim());
      onSaveToken(inputToken.trim());
      setSuccessMsg(`تم الاتصال بنجاح بحساب GitHub (${user.login})! تم منح الصلاحيات لقراءة المستودعات الخاصة.`);
      
      // Auto-test Suly_besnes
      const check = await GitHubService.testRepoAccess('eslammohamedk123450-netizen', 'Suly_besnes', inputToken.trim());
      setTestResult({
        tested: true,
        success: check.success,
        message: check.message,
      });

      onRefreshRepos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTestRepoDirect = async (repoName: string) => {
    setIsVerifying(true);
    const check = await GitHubService.testRepoAccess('eslammohamedk123450-netizen', repoName, token || undefined);
    setTestResult({
      tested: true,
      success: check.success,
      message: check.message,
    });
    setIsVerifying(false);
  };

  const filteredRepos = repos.filter(r => 
    r.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(repoSearch.toLowerCase()))
  );

  const copyUrl = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                الاتصال المباشر بحساب GitHub
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">
                  Suly Repositories
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                الوصول إلى مستودع <span className="text-emerald-300 font-mono">Suly_besnes</span> ومستودعات <span className="font-mono text-slate-200">eslammohamedk123450-netizen</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Diagnostic Note for Suly_besnes */}
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-amber-300">
                  حالة الوصول إلى مستودع: <span className="font-mono underline">eslammohamedk123450-netizen/Suly_besnes</span>
                </p>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  يعود رابط المستودع بـ (HTTP 404 Not Found) في الطلبات العامة لأن المستودع <strong className="text-white">خاص (Private Repository)</strong> على حسابك في GitHub، أو أنه يتطلب إذن وصول معتمد.
                  لربطه مباشرة وقراءة كوده ومزامنة البيانات، أدخل رمز الوصول <span className="font-mono text-emerald-300">GitHub Personal Access Token</span> بالأسفل بصلاحية <code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-300">repo</code>.
                </p>
              </div>
            </div>
          </div>

          {/* GitHub Token Form */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-emerald-400" />
                رمز الوصول الشخصي (GitHub Personal Access Token)
              </label>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=Suly+Business+AI+Studio"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline underline-offset-2 font-medium"
              >
                توليد رمز جديد بنقرة واحدة (GitHub Tokens)
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="password"
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono tracking-wider"
                />
              </div>
              <button
                onClick={handleVerifyAndSave}
                disabled={isVerifying}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    حفظ وربط الحساب
                  </>
                )}
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </p>
            )}

            {successMsg && (
              <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {successMsg}
              </p>
            )}

            {/* Test connection indicator */}
            {testResult && (
              <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                testResult.success 
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Connected User Profile Banner */}
          {currentUser && (
            <div className="flex items-center justify-between p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.login}
                  className="w-10 h-10 rounded-full border border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{currentUser.name || currentUser.login}</span>
                    <span className="text-xs font-mono text-emerald-400">@{currentUser.login}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                    <span>المستودعات العامة: {currentUser.public_repos}</span>
                    {currentUser.total_private_repos !== undefined && (
                      <span className="text-emerald-300">المستودعات الخاصة: {currentUser.total_private_repos}</span>
                    )}
                  </div>
                </div>
              </div>
              <a
                href={currentUser.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800"
              >
                الملف الشخصي
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Repositories Browser */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                المستودعات المتاحة لحسابك ({repos.length})
              </h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={repoSearch}
                    onChange={(e) => setRepoSearch(e.target.value)}
                    placeholder="ابحث في المستودعات..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-8 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  onClick={onRefreshRepos}
                  disabled={isLoadingRepos}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                  title="تحديث القائمة"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRepos ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* List of Repos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {filteredRepos.map((repo) => {
                const isSelected = selectedRepoName.toLowerCase() === repo.name.toLowerCase();
                return (
                  <div
                    key={repo.id}
                    onClick={() => onSelectRepo(repo.name)}
                    className={`p-3 rounded-xl border text-right cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/30 border-emerald-500/60 shadow-md shadow-emerald-950/20'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {repo.private ? (
                          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" title="مستودع خاص" />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" title="مستودع عام" />
                        )}
                        <span className={`text-xs font-bold font-mono ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                          {repo.name}
                        </span>
                      </div>
                      {isSelected ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                          المستودع النشط
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          {repo.language || 'Code'}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5">
                      {repo.description || 'لا يوجد وصف للمستودع'}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                      <span>الفرع: {repo.default_branch}</span>
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                      >
                        فتح في GitHub
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                );
              })}

              {/* Special Card for Suly_besnes if not in public list */}
              {!filteredRepos.some(r => r.name.toLowerCase() === 'suly_besnes') && (
                <div 
                  onClick={() => handleTestRepoDirect('Suly_besnes')}
                  className="p-3 rounded-xl border border-dashed border-amber-500/40 bg-amber-950/20 hover:bg-amber-950/30 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-bold font-mono text-amber-300">
                        Suly_besnes
                      </span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      مستودع خاص / فحص
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 mt-1">
                    المستودع المطلوب. انقر لفحص الاتصال المباشر به باستخدام رمز الوصول الحالي.
                  </p>
                  <div className="mt-2 pt-2 border-t border-amber-500/20 text-[10px] text-amber-400 flex items-center gap-1">
                    <span>انقر للفحص</span>
                    <ChevronLeft className="w-3 h-3" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyUrl('https://github.com/eslammohamedk123450-netizen/Suly_besnes')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'تم نسخ الرابط' : 'نسخ رابط Suly_besnes'}
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
