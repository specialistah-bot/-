/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { CameraStudio } from './components/CameraStudio';
import { PhotoSelector } from './components/PhotoSelector';
import { PhotoCustomizer } from './components/PhotoCustomizer';
import { Step } from './types/photobooth';
import { soundEffects } from './utils/audio';

export default function App() {
  const [step, setStep] = useState<Step>('ready');
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [classNameInput, setClassNameInput] = useState<string>('햇살가득 햇님반');

  // Total 5 photos captured
  const [fivePhotos, setFivePhotos] = useState<string[]>([]);

  // 4 photos selected for the four-cut frame
  const [fourPhotos, setFourPhotos] = useState<string[]>([]);

  const toggleSound = () => {
    const nextVal = !soundOn;
    setSoundOn(nextVal);
    soundEffects.setEnabled(nextVal);
    if (nextVal) {
      soundEffects.playPop();
    }
  };

  // When 5-shot shooting completes
  const handleShootingComplete = (photos: string[]) => {
    setFivePhotos(photos);
    setStep('selecting');
  };

  // When user finishes picking 4 photos out of 5
  const handleSelectionConfirm = (selectedFour: string[]) => {
    setFourPhotos(selectedFour);
    setStep('customizing');
  };

  // Reset back to camera
  const handleReset = () => {
    soundEffects.playPop();
    setFivePhotos([]);
    setFourPhotos([]);
    setStep('ready');
  };

  // Back to selection from customizing
  const handleBackToSelection = () => {
    soundEffects.playPop();
    setStep('selecting');
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-800 flex flex-col selection:bg-amber-200">
      {/* Top Bar following Top Bar Contract */}
      <HeaderBar
        soundOn={soundOn}
        onToggleSound={toggleSound}
        onReset={handleReset}
        currentStep={step}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col justify-center">
        {(step === 'ready' || step === 'shooting') && (
          <CameraStudio
            onCompleteShooting={handleShootingComplete}
            classNameInput={classNameInput}
            setClassNameInput={setClassNameInput}
          />
        )}

        {step === 'selecting' && (
          <PhotoSelector
            photos={fivePhotos}
            onConfirmSelection={handleSelectionConfirm}
            onRetakeAll={handleReset}
          />
        )}

        {step === 'customizing' && (
          <PhotoCustomizer
            photos={fourPhotos}
            classNameInput={classNameInput}
            onRetakeAll={handleReset}
            onBackToSelection={handleBackToSelection}
          />
        )}
      </main>

      {/* Subtle clean kindergarten footer */}
      <footer className="w-full py-4 border-t border-amber-100/80 bg-white/50 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>우리반 네컷 · 유치원 & 어린이집 즉석 포토부스</span>
          <div className="flex items-center gap-4 text-slate-500">
            <span>3초 카운트다운</span>
            <span>·</span>
            <span>5장 촬영 중 4장 선택</span>
            <span>·</span>
            <span>맞춤형 프레임 & 스티커</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
