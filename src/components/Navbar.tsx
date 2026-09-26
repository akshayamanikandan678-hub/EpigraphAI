import React from 'react';
import { BookOpen, Camera, Cpu, Layers, Sparkles, MapPin, Database, Volume2, ShieldCheck, Wifi, WifiOff } from 'lucide-react';

export type ActiveTab = 'workbench' | 'palaeography' | 'synthetic' | 'archive' | 'consultant';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOfflineMode: boolean;
  setIsOfflineMode: (offline: boolean) => void;
  onOpenCamera: () => void;
  onOpenUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isOfflineMode,
  setIsOfflineMode,
  onOpenCamera,
  onOpenUpload,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-800 bg-stone-950/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('workbench')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 shadow-lg shadow-amber-900/30 border border-amber-500/40 text-stone-900 font-serif-heading font-black text-xl">
              𑀓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-heading text-lg font-bold tracking-wider text-amber-200">
                  Epigraph<span className="text-amber-500">AI</span>
                </span>
                <span className="rounded bg-amber-950/80 px-2 py-0.5 text-[10px] font-mono-code font-semibold tracking-wider text-amber-300 border border-amber-800/60 uppercase">
                  CV v2.4
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                Ancient Tamil & Sanskrit Inscription Digitizer
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl bg-stone-900/80 p-1 border border-stone-800">
            <button
              onClick={() => setActiveTab('workbench')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'workbench'
                  ? 'bg-amber-600/90 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Vision Workbench</span>
            </button>

            <button
              onClick={() => setActiveTab('palaeography')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'palaeography'
                  ? 'bg-amber-600/90 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Palaeography Chart</span>
            </button>

            <button
              onClick={() => setActiveTab('synthetic')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'synthetic'
                  ? 'bg-amber-600/90 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Synthetic Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('archive')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'archive'
                  ? 'bg-amber-600/90 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Heritage GIS</span>
            </button>

            <button
              onClick={() => setActiveTab('consultant')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'consultant'
                  ? 'bg-amber-600/90 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>AI Epigraphist</span>
            </button>
          </nav>

          {/* Action Tools & Offline Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOfflineMode(!isOfflineMode)}
              title={isOfflineMode ? 'Running in Offline TFLite / Canvas Mode' : 'Online Gemini & IndicBERT Connected'}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                isOfflineMode
                  ? 'border-emerald-600/50 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/40'
                  : 'border-stone-700 bg-stone-900 text-stone-300 hover:border-stone-600'
              }`}
            >
              {isOfflineMode ? (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Offline Field Mode</span>
                </>
              ) : (
                <>
                  <Wifi className="h-3.5 w-3.5 text-amber-400" />
                  <span className="hidden sm:inline">AI Online</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenCamera}
              className="flex items-center gap-1.5 rounded-lg bg-stone-800 border border-stone-700 px-3 py-1.5 text-xs font-medium text-stone-200 hover:bg-stone-700 hover:text-white transition-colors"
              title="Camera Capture for Field Researchers"
            >
              <Camera className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Camera</span>
            </button>

            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-medium px-3 py-1.5 text-xs shadow-md transition-colors"
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Upload Stone</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex overflow-x-auto border-t border-stone-800 bg-stone-900/90 px-2 py-1.5 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('workbench')}
          className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'workbench' ? 'bg-amber-600 text-white' : 'text-stone-300'}`}
        >
          Workbench
        </button>
        <button
          onClick={() => setActiveTab('palaeography')}
          className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'palaeography' ? 'bg-amber-600 text-white' : 'text-stone-300'}`}
        >
          Palaeography
        </button>
        <button
          onClick={() => setActiveTab('synthetic')}
          className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'synthetic' ? 'bg-amber-600 text-white' : 'text-stone-300'}`}
        >
          Synthetic Studio
        </button>
        <button
          onClick={() => setActiveTab('archive')}
          className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'archive' ? 'bg-amber-600 text-white' : 'text-stone-300'}`}
        >
          Heritage GIS
        </button>
        <button
          onClick={() => setActiveTab('consultant')}
          className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'consultant' ? 'bg-amber-600 text-white' : 'text-stone-300'}`}
        >
          AI Epigraphist
        </button>
      </div>
    </header>
  );
};
