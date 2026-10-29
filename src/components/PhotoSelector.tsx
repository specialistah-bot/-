import React, { useState } from 'react';
import { CheckCircle2, Circle, ArrowLeft, ArrowRight, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface PhotoSelectorProps {
  photos: string[]; // 5 photos
  onConfirmSelection: (selectedFour: string[]) => void;
  onRetakeAll: () => void;
}

export const PhotoSelector: React.FC<PhotoSelectorProps> = ({
  photos,
  onConfirmSelection,
  onRetakeAll,
}) => {
  // Array of selected photo indices (up to 4 indices) in order of appearance
  // Initial default: first 4 photos [0, 1, 2, 3]
  const [selectedIndices, setSelectedIndices] = useState<number[]>([0, 1, 2, 3]);

  // Toggle selection of a photo index
  const handleToggle = (index: number) => {
    soundEffects.playPop();

    if (selectedIndices.includes(index)) {
      // Remove from selection
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      // Add to selection if < 4
      if (selectedIndices.length < 4) {
        setSelectedIndices([...selectedIndices, index]);
      } else {
        // If already 4 selected, replace the 4th with this new one
        const updated = [...selectedIndices.slice(0, 3), index];
        setSelectedIndices(updated);
      }
    }
  };

  // Move a selected photo left/up in slot order
  const handleMoveLeft = (slotIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (slotIdx <= 0) return;
    soundEffects.playPop();
    const updated = [...selectedIndices];
    const temp = updated[slotIdx - 1];
    updated[slotIdx - 1] = updated[slotIdx];
    updated[slotIdx] = temp;
    setSelectedIndices(updated);
  };

  // Move a selected photo right/down in slot order
  const handleMoveRight = (slotIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (slotIdx >= selectedIndices.length - 1) return;
    soundEffects.playPop();
    const updated = [...selectedIndices];
    const temp = updated[slotIdx + 1];
    updated[slotIdx + 1] = updated[slotIdx];
    updated[slotIdx] = temp;
    setSelectedIndices(updated);
  };

  const isReady = selectedIndices.length === 4;

  const handleProceed = () => {
    if (!isReady) return;
    soundEffects.playFanfare();
    const fourPhotos = selectedIndices.map((i) => photos[i]);
    onConfirmSelection(fourPhotos);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-8 flex flex-col items-center">
      {/* Step Header */}
      <div className="w-full text-center mb-6">
        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-semibold mb-2">
          총 5장 중 4장 선택 단계
        </span>
        <h2 className="font-jua text-2xl sm:text-3xl text-amber-950">
          우리반 최고의 순간 4장을 골라주세요!
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-xl mx-auto">
          사진을 클릭하여 선택하거나 해제할 수 있습니다. 아래에서 네 컷에 들어갈 순서도 바꿀 수 있어요.
        </p>
      </div>

      {/* 5 Photos Gallery Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        {photos.map((src, idx) => {
          const slotPosition = selectedIndices.indexOf(idx);
          const isSelected = slotPosition !== -1;

          return (
            <div
              key={idx}
              onClick={() => handleToggle(idx)}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer border-4 transition-all duration-200 transform hover:-translate-y-1 shadow-md ${
                isSelected
                  ? 'border-amber-400 ring-4 ring-amber-200 scale-102 bg-amber-50'
                  : 'border-slate-200 opacity-70 hover:opacity-100 bg-white'
              }`}
            >
              {/* Photo Image Aspect 4:3 */}
              <div className="aspect-4/3 w-full bg-slate-100 relative">
                <img
                  src={src}
                  alt={`촬영본 ${idx + 1}`}
                  className="w-full h-full object-cover select-none"
                />

                {/* Number Badge Top-Left */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-xs px-2 py-0.5 rounded-md font-semibold">
                  사진 #{idx + 1}
                </div>

                {/* Selection Check Indicator Top-Right */}
                <div className="absolute top-2 right-2">
                  {isSelected ? (
                    <div className="bg-amber-400 text-amber-950 font-jua text-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-4 h-4 fill-amber-950 text-white" />
                      <span>{slotPosition + 1}번 컷</span>
                    </div>
                  ) : (
                    <div className="bg-black/40 text-white p-1 rounded-full">
                      <Circle className="w-5 h-5 text-white/80" />
                    </div>
                  )}
                </div>

                {/* Selection Overlay Tint */}
                {isSelected && (
                  <div className="absolute inset-0 bg-amber-500/10 pointer-events-none" />
                )}
              </div>

              {/* Bottom Card Bar */}
              <div className="p-2.5 text-center bg-white flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">
                  {idx === 0 && '활짝 웃음'}
                  {idx === 1 && '꽃받침'}
                  {idx === 2 && '손하트'}
                  {idx === 3 && '브이 포즈'}
                  {idx === 4 && '개구쟁이'}
                </span>
                <span className={`text-xs font-jua ${isSelected ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                  {isSelected ? `선택됨 (${slotPosition + 1}/4)` : '선택하기'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live 4-Slot Order Deck */}
      <div className="w-full max-w-4xl bg-white border border-amber-200 rounded-3xl p-5 sm:p-6 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-100">
          <div>
            <h3 className="font-jua text-lg text-amber-950 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              <span>네 컷 배치 순서 (현재 {selectedIndices.length}/4장)</span>
            </h3>
            <p className="text-xs text-slate-500">
              화살표 버튼으로 네 컷 프레임에 들어갈 상하 순서를 변경할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                isReady
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800 animate-pulse'
              }`}
            >
              {isReady ? '✓ 4장 선택 완료' : `${4 - selectedIndices.length}장을 더 선택해주세요`}
            </span>
          </div>
        </div>

        {/* 4 Selected Slots Preview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[0, 1, 2, 3].map((slotIdx) => {
            const photoIdx = selectedIndices[slotIdx];
            const hasPhoto = photoIdx !== undefined;

            return (
              <div
                key={slotIdx}
                className={`relative rounded-2xl border-2 border-dashed p-2 transition-all flex flex-col items-center justify-between ${
                  hasPhoto
                    ? 'border-amber-300 bg-amber-50/50'
                    : 'border-slate-300 bg-slate-50/60 min-h-[160px]'
                }`}
              >
                <div className="w-full flex items-center justify-between mb-1 px-1">
                  <span className="font-jua text-xs text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                    {slotIdx + 1}번째 컷
                  </span>
                  {hasPhoto && (
                    <button
                      type="button"
                      onClick={() => handleToggle(photoIdx)}
                      className="text-xs text-slate-400 hover:text-red-500 font-sans"
                      title="선택 해제"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {hasPhoto ? (
                  <div className="w-full aspect-4/3 rounded-xl overflow-hidden shadow-xs mb-2 relative">
                    <img
                      src={photos[photoIdx]}
                      alt={`슬롯 ${slotIdx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                      사진 #{photoIdx + 1}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs py-6">
                    <Circle className="w-6 h-6 mb-1 text-slate-300 stroke-1" />
                    <span>위에서 선택</span>
                  </div>
                )}

                {/* Reorder Left/Right Arrows */}
                {hasPhoto && (
                  <div className="w-full flex items-center justify-center gap-2 pt-1 border-t border-amber-100">
                    <button
                      type="button"
                      disabled={slotIdx === 0}
                      onClick={(e) => handleMoveLeft(slotIdx, e)}
                      className="p-1 rounded-md text-amber-800 hover:bg-amber-200 disabled:opacity-20 disabled:hover:bg-transparent"
                      title="앞 순서로 이동"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] font-bold text-amber-900">{slotIdx + 1}</span>
                    <button
                      type="button"
                      disabled={slotIdx === selectedIndices.length - 1}
                      onClick={(e) => handleMoveRight(slotIdx, e)}
                      className="p-1 rounded-md text-amber-800 hover:bg-amber-200 disabled:opacity-20 disabled:hover:bg-transparent"
                      title="다음 순서로 이동"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
        <button
          type="button"
          onClick={handleProceed}
          disabled={!isReady}
          className={`w-full py-4 rounded-2xl font-jua text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
            isReady
              ? 'bg-gradient-to-r from-pink-400 via-pink-500 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white cursor-pointer shadow-pink-200/80'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>{isReady ? '선택 완료! 프레임 꾸미러 가기' : '4장을 모두 선택해주세요'}</span>
        </button>

        <button
          type="button"
          onClick={onRetakeAll}
          className="w-full sm:w-auto px-5 py-3 text-slate-600 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>다시 촬영하기</span>
        </button>
      </div>
    </div>
  );
};
