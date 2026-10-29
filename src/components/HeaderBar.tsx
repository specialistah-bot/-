import React from 'react';
import { Volume2, VolumeX, Sparkles, RefreshCw } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface HeaderBarProps {
  soundOn: boolean;
  onToggleSound: () => void;
  onReset: () => void;
  currentStep: string;
  onNavigateStep?: (step: string) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  soundOn,
  onToggleSound,
  onReset,
  currentStep,
}) => {
  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-amber-100 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <span className="font-jua text-xl text-amber-900 tracking-tight">
            우리반 네컷 사진관
          </span>
        </div>

        {/* Zone 2: Navigation / Step flow links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <span
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentStep === 'ready' || currentStep === 'shooting'
                ? 'text-amber-600 font-bold border-b-2 border-amber-500 pb-0.5'
                : 'text-slate-500'
            }`}
          >
            1. 5장 촬영하기
          </span>
          <span className="text-slate-300">/</span>
          <span
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentStep === 'selecting'
                ? 'text-amber-600 font-bold border-b-2 border-amber-500 pb-0.5'
                : 'text-slate-500'
            }`}
          >
            2. 베스트 4장 선택
          </span>
          <span className="text-slate-300">/</span>
          <span
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentStep === 'customizing'
                ? 'text-amber-600 font-bold border-b-2 border-amber-500 pb-0.5'
                : 'text-slate-500'
            }`}
          >
            3. 프레임 & 스티커 꾸미기
          </span>
        </nav>

        {/* Zone 3: Single Primary Action zone (Sound toggle + Restart) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundOn ? '효과음 끄기' : '효과음 켜기'}
            className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-slate-200"
            title={soundOn ? '효과음 켜짐' : '효과음 꺼짐'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="px-3.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>처음부터 다시</span>
          </button>
        </div>
      </div>
    </header>
  );
};
