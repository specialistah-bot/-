import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Printer,
  Sparkles,
  Share2,
  RefreshCw,
  Sliders,
  Palette,
  Layout,
  Type,
  Sticker as StickerIcon,
  Check,
  RotateCw,
  Trash2,
  ZoomIn,
  ZoomOut,
  Copy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  FrameTheme,
  FRAME_THEMES,
  LayoutMode,
  PhotoFilter,
  PlacedSticker,
  STICKER_PRESETS,
} from '../types/photobooth';
import { renderPhotoboothToCanvas } from '../utils/canvasRenderer';
import { soundEffects } from '../utils/audio';

interface PhotoCustomizerProps {
  photos: string[]; // exactly 4 photos
  classNameInput: string;
  onRetakeAll: () => void;
  onBackToSelection: () => void;
}

export const PhotoCustomizer: React.FC<PhotoCustomizerProps> = ({
  photos,
  classNameInput,
  onRetakeAll,
  onBackToSelection,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<FrameTheme>(FRAME_THEMES[0]);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('strip');
  const [filter, setFilter] = useState<PhotoFilter>('none');

  // Text custom inputs
  const [title, setTitle] = useState<string>(classNameInput || '햇살가득 햇님반');
  const [subtitle, setSubtitle] = useState<string>('선생님과 친구들의 행복한 하루');
  const [dateStr, setDateStr] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}`;
  });

  // Stickers placed on frame
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);

  // Hidden canvas for exporting high-res PNG
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  // Trigger celebration confetti on mount
  useEffect(() => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  // Add new sticker to center of preview
  const handleAddSticker = (emoji: string) => {
    soundEffects.playPop();
    const newSticker: PlacedSticker = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      emoji,
      x: 35 + Math.random() * 30,
      y: 20 + Math.random() * 50,
      scale: 1,
      rotation: Math.floor(Math.random() * 30) - 15,
    };
    setStickers((prev) => [...prev, newSticker]);
    setActiveStickerId(newSticker.id);
  };

  // Sticker adjustments
  const handleRotateSticker = (id: string, delta: number) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, rotation: (s.rotation + delta) % 360 } : s))
    );
  };

  const handleScaleSticker = (id: string, delta: number) => {
    setStickers((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, scale: Math.max(0.5, Math.min(2.5, s.scale + delta)) } : s
      )
    );
  };

  const handleDeleteSticker = (id: string) => {
    soundEffects.playPop();
    setStickers((prev) => prev.filter((s) => s.id !== id));
    if (activeStickerId === id) setActiveStickerId(null);
  };

  // Dragging sticker on preview
  const handleStickerDragStart = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setActiveStickerId(id);

    const container = previewContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const clientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const pctX = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
      const pctY = Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100));

      setStickers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, x: pctX, y: pctY } : s))
      );
    };

    const onEnd = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

  // Export High-Res PNG
  const handleDownload = async () => {
    if (!exportCanvasRef.current) return;
    setIsExporting(true);
    soundEffects.playPop();

    try {
      await renderPhotoboothToCanvas(exportCanvasRef.current, {
        photos,
        theme: selectedTheme,
        layout: layoutMode,
        filter,
        title,
        subtitle,
        dateStr,
        stickers,
      });

      const dataUrl = exportCanvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `우리반네컷_${title.replace(/\s+/g, '_')}_${dateStr.replace(/[^0-9]/g, '')}.png`;
      link.href = dataUrl;
      link.click();

      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.5 },
      });
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Copy to Clipboard
  const handleCopyClipboard = async () => {
    if (!exportCanvasRef.current) return;
    setIsExporting(true);

    try {
      await renderPhotoboothToCanvas(exportCanvasRef.current, {
        photos,
        theme: selectedTheme,
        layout: layoutMode,
        filter,
        title,
        subtitle,
        dateStr,
        stickers,
      });

      exportCanvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          soundEffects.playPop();
          setCopiedNotice(true);
          setTimeout(() => setCopiedNotice(false), 2500);
        } catch {
          // Fallback if browser blocks clipboard item
          handleDownload();
        }
      });
    } catch (err) {
      console.error('Copy error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Print Action
  const handlePrint = async () => {
    if (!exportCanvasRef.current) return;
    setIsExporting(true);

    try {
      await renderPhotoboothToCanvas(exportCanvasRef.current, {
        photos,
        theme: selectedTheme,
        layout: layoutMode,
        filter,
        title,
        subtitle,
        dateStr,
        stickers,
      });

      const dataUrl = exportCanvasRef.current.toDataURL('image/png');

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title} - 우리반 네컷</title>
              <style>
                @page { size: auto; margin: 10mm; }
                body { margin: 0; display: flex; justify-content: center; align-items: center; background: #fff; }
                img { max-height: 95vh; max-width: 95vw; object-fit: contain; box-shadow: none; }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" onload="window.print();window.close();" />
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        window.print();
      }
    } catch (err) {
      console.error('Print error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // CSS Filter class mapping for live preview
  const getFilterStyle = (): React.CSSProperties => {
    switch (filter) {
      case 'bright':
        return { filter: 'brightness(1.08) contrast(1.03) saturate(1.15)' };
      case 'warm':
        return { filter: 'sepia(0.2) contrast(1.05) brightness(1.05)' };
      case 'vintage':
        return { filter: 'sepia(0.35) contrast(0.95) saturate(0.9)' };
      case 'mono':
        return { filter: 'grayscale(1) contrast(1.1)' };
      case 'none':
      default:
        return {};
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {/* Hidden offscreen canvas for crisp rendering & export */}
      <canvas ref={exportCanvasRef} className="hidden" />

      {/* Main 2-Column Split: Left Preview / Right Control Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Interactive Live Photobooth Strip Preview (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col items-center sticky top-20">
          <div className="w-full flex items-center justify-between mb-3 px-1">
            <span className="font-jua text-sm text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>실시간 네컷 미리보기</span>
            </span>
            <span className="text-xs text-slate-500">
              {layoutMode === 'strip' ? '인생네컷 세로 스트립' : '2x2 격자 네컷'}
            </span>
          </div>

          {/* Photobooth Strip Shell with Theme Styling */}
          <div
            ref={previewContainerRef}
            onClick={() => setActiveStickerId(null)}
            className={`relative w-full max-w-sm rounded-3xl p-4 sm:p-5 shadow-2xl border-4 transition-all duration-300 select-none overflow-hidden ${
              selectedTheme.bgClass
            } ${selectedTheme.borderClass}`}
            style={{
              minHeight: layoutMode === 'strip' ? '680px' : '450px',
            }}
          >
            {/* Top Brand & Class Name Header in Strip */}
            <div className="text-center pt-1 pb-3">
              <div
                className={`font-jua text-xl sm:text-2xl tracking-tight ${selectedTheme.textColor}`}
              >
                {title || '우리반 네컷'}
              </div>
              {subtitle && (
                <div
                  className={`text-xs font-jua mt-0.5 opacity-80 ${selectedTheme.subTextColor}`}
                >
                  {subtitle}
                </div>
              )}
            </div>

            {/* Photos Container (Strip 1x4 or Grid 2x2) */}
            <div
              className={`w-full ${
                layoutMode === 'strip'
                  ? 'flex flex-col gap-3'
                  : 'grid grid-cols-2 gap-2.5'
              }`}
            >
              {photos.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-white shadow-sm border border-black/5"
                >
                  <img
                    src={src}
                    alt={`네컷 ${i + 1}`}
                    style={getFilterStyle()}
                    className="w-full h-full object-cover transition-all"
                  />
                  {/* Photo Index Number Badge */}
                  <div
                    className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-jua shadow-xs ${
                      selectedTheme.id === 'starlight'
                        ? 'bg-black/60 text-amber-300'
                        : 'bg-white/80 text-slate-800'
                    }`}
                  >
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Footer Details */}
            <div className="pt-4 pb-2 text-center border-t border-black/10 mt-3">
              <div
                className={`font-jua text-sm sm:text-base ${selectedTheme.textColor} flex items-center justify-center gap-1.5`}
              >
                <span>✨ 우리들의 소중한 오늘 ✨</span>
              </div>
              <div className="text-[11px] font-sans font-medium text-slate-500 mt-0.5">
                {dateStr}
              </div>
              <div className="text-[9px] font-sans text-slate-400 tracking-wider mt-0.5 uppercase">
                OUR CLASS 4-CUTS PHOTOBOOTH
              </div>
            </div>

            {/* Placed Interactive Stickers Overlay */}
            {stickers.map((stk) => {
              const isActive = activeStickerId === stk.id;

              return (
                <div
                  key={stk.id}
                  onMouseDown={(e) => handleStickerDragStart(stk.id, e)}
                  onTouchStart={(e) => handleStickerDragStart(stk.id, e)}
                  style={{
                    left: `${stk.x}%`,
                    top: `${stk.y}%`,
                    transform: `translate(-50%, -50%) rotate(${stk.rotation}deg) scale(${stk.scale})`,
                  }}
                  className={`absolute cursor-move select-none group z-30 transition-shadow ${
                    isActive ? 'ring-2 ring-amber-400 ring-offset-2 rounded-xl' : ''
                  }`}
                >
                  <span className="text-4xl sm:text-5xl drop-shadow-md inline-block">
                    {stk.emoji}
                  </span>

                  {/* Active Sticker Micro Toolbar */}
                  {isActive && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/80 backdrop-blur-xs text-white px-2 py-1 rounded-lg text-xs shadow-lg whitespace-nowrap z-40"
                    >
                      <button
                        type="button"
                        onClick={() => handleRotateSticker(stk.id, 15)}
                        className="hover:text-amber-300 p-0.5"
                        title="회전"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleScaleSticker(stk.id, 0.15)}
                        className="hover:text-amber-300 p-0.5"
                        title="크게"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleScaleSticker(stk.id, -0.15)}
                        className="hover:text-amber-300 p-0.5"
                        title="작게"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSticker(stk.id)}
                        className="hover:text-red-400 p-0.5"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-2">
            💡 스티커를 클릭하여 원하는 위치로 자유롭게 드래그하세요!
          </p>
        </div>

        {/* RIGHT COLUMN: Customization Decks & Output Actions (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Main Action Bar at top for fast export */}
          <div className="bg-white border border-amber-200 rounded-3xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-100">
              <div>
                <h3 className="font-jua text-lg text-amber-950 flex items-center gap-2">
                  <span>📸 완성이예요! 저장하거나 인쇄해보세요</span>
                </h3>
                <p className="text-xs text-slate-500">
                  고화질로 렌더링되어 유치원 포토앨범이나 가정 통신문에 바로 인쇄할 수 있습니다.
                </p>
              </div>

              {copiedNotice && (
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 클립보드 복사됨!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isExporting}
                className="py-3 px-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-jua rounded-2xl shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>{isExporting ? '사진 생성 중...' : '고화질 PNG 다운로드'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                disabled={isExporting}
                className="py-3 px-4 bg-amber-100 hover:bg-amber-200 text-amber-950 font-jua rounded-2xl transition-colors flex items-center justify-center gap-2 border border-amber-200"
              >
                <Printer className="w-5 h-5 text-amber-700" />
                <span>프린터로 인쇄</span>
              </button>

              <button
                type="button"
                onClick={handleCopyClipboard}
                disabled={isExporting}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-jua rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4 text-slate-600" />
                <span>이미지 복사</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: Frame Theme Selection */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-5 h-5 text-amber-500" />
              <h3 className="font-jua text-base text-slate-900">1. 프레임 테마 선택</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {FRAME_THEMES.map((theme) => {
                const isSelected = selectedTheme.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playPop();
                      setSelectedTheme(theme);
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-200 bg-amber-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-6 h-6 rounded-full border border-black/10 ${theme.previewBg}`}
                      />
                      {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                    </div>
                    <div>
                      <div className="font-jua text-sm text-slate-900">{theme.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{theme.subName}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: Layout & Photo Filter */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Layout switch */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Layout className="w-4 h-4 text-amber-500" />
                <h4 className="font-jua text-sm text-slate-900">네컷 레이아웃</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    setLayoutMode('strip');
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-jua transition-colors flex items-center justify-center gap-1.5 ${
                    layoutMode === 'strip'
                      ? 'bg-amber-400 text-amber-950 border-amber-400 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>세로 4컷 (스트립)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    setLayoutMode('grid');
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-jua transition-colors flex items-center justify-center gap-1.5 ${
                    layoutMode === 'grid'
                      ? 'bg-amber-400 text-amber-950 border-amber-400 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>정사각형 (2x2)</span>
                </button>
              </div>
            </div>

            {/* Filter selection */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Sliders className="w-4 h-4 text-amber-500" />
                <h4 className="font-jua text-sm text-slate-900">사진 색감 필터</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'none', label: '기본 원본' },
                  { id: 'bright', label: '✨ 뽀샤시' },
                  { id: 'warm', label: '☀️ 따뜻함' },
                  { id: 'vintage', label: '🎞️ 빈티지' },
                  { id: 'mono', label: '🖤 흑백' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playPop();
                      setFilter(item.id as PhotoFilter);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filter === item.id
                        ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: Editable Text Details */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-5 h-5 text-amber-500" />
              <h3 className="font-jua text-base text-slate-900">3. 우리반 이름 & 문구 입력</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  제목 (우리반 이름)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 햇살가득 햇님반"
                  className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 font-jua"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">소제목 문구</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="예: 우리들의 행복한 하루"
                  className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">날짜 표시</label>
                <input
                  type="text"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  placeholder="예: 2026. 10. 29"
                  className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Cute Stickers Palette */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <StickerIcon className="w-5 h-5 text-amber-500" />
                <h3 className="font-jua text-base text-slate-900">
                  4. 귀여운 스티커 콕콕 붙이기
                </h3>
              </div>
              {stickers.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    setStickers([]);
                  }}
                  className="text-xs text-slate-400 hover:text-red-500"
                >
                  스티커 모두 지우기
                </button>
              )}
            </div>

            <p className="text-xs text-slate-500 mb-3">
              마음에 드는 스티커를 클릭하면 사진 위에 부착됩니다. 부착된 스티커를 끌어서 원하는 곳에 놓아보세요!
            </p>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {STICKER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleAddSticker(preset.emoji)}
                  className="p-2 bg-amber-50/60 hover:bg-amber-100/80 rounded-2xl border border-amber-100 flex flex-col items-center justify-center transition-transform active:scale-90 cursor-pointer"
                  title={preset.label}
                >
                  <span className="text-2xl mb-0.5">{preset.emoji}</span>
                  <span className="text-[10px] text-amber-900 font-medium truncate">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation links at bottom */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onBackToSelection}
              className="text-xs text-slate-500 hover:text-amber-700 font-medium py-2 px-3 rounded-lg hover:bg-amber-50 transition-colors"
            >
              ← 다른 사진으로 다시 고르기
            </button>

            <button
              type="button"
              onClick={onRetakeAll}
              className="text-xs text-slate-500 hover:text-amber-700 font-medium py-2 px-3 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>새로운 5장 다시 찍기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
