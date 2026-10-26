import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Store, 
  FolderGit2, 
  Lock, 
  CheckCircle2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { SulyLogo } from './SulyLogo';
import { GitHubUser } from '../types';

export type ActiveTab = 'dashboard' | 'products' | 'orders' | 'customers' | 'storefront' | 'explorer';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenGitHubModal: () => void;
  currentUser: GitHubUser | null;
  selectedRepoName: string;
  cartCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenGitHubModal,
  currentUser,
  selectedRepoName,
  cartCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-18 gap-3">
          {/* Logo & Brand */}
          <div 
            onClick={() => onSelectTab('dashboard')}
            className="cursor-pointer transition-transform hover:scale-[1.02]"
          >
            <SulyLogo size={42} showText={true} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              لوحة التحكم
            </button>

            <button
              onClick={() => onSelectTab('products')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'products'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Package className="w-4 h-4" />
              المنتجات
            </button>

            <button
              onClick={() => onSelectTab('orders')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              الطلبات
            </button>

            <button
              onClick={() => onSelectTab('customers')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'customers'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              العملاء
            </button>

            <button
              onClick={() => onSelectTab('explorer')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'explorer'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FolderGit2 className="w-4 h-4" />
              كود GitHub
            </button>

            <button
              onClick={() => onSelectTab('storefront')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
                activeTab === 'storefront'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/60'
              }`}
            >
              <Store className="w-4 h-4" />
              المتجر المباشر
              {cartCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center font-mono">
                  {cartCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* GitHub Connection Badge Button */}
            <button
              onClick={onOpenGitHubModal}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                currentUser
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/60'
                  : 'bg-slate-900 border-amber-500/40 text-amber-300 hover:bg-slate-800'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5 shrink-0" />
              {currentUser ? (
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="hidden sm:inline">@{currentUser.login}</span>
                  <span className="text-slate-400">/</span>
                  <span className="font-bold">{selectedRepoName}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold">اتصال GitHub ({selectedRepoName})</span>
                </div>
              )}
            </button>

            {/* Quick Preview Store CTA */}
            <button
              onClick={() => onSelectTab('storefront')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all"
            >
              <Store className="w-3.5 h-3.5" />
              <span>معاينة المتجر</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden items-center justify-between py-2 border-t border-slate-800/80 overflow-x-auto gap-1">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            الرئيسية
          </button>
          <button
            onClick={() => onSelectTab('products')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'products' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            المنتجات
          </button>
          <button
            onClick={() => onSelectTab('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            الطلبات
          </button>
          <button
            onClick={() => onSelectTab('explorer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'explorer' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            الكود
          </button>
          <button
            onClick={() => onSelectTab('storefront')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'storefront' ? 'bg-emerald-600 text-white' : 'text-emerald-400'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            المتجر
          </button>
        </div>
      </div>
    </header>
  );
};
