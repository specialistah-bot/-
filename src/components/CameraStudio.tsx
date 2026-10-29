import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, SwitchCamera, Sparkles, AlertCircle, Play, Image as ImageIcon, CheckCircle, RefreshCw } from 'lucide-react';
import { soundEffects } from '../utils/audio';
import { SAMPLE_PHOTOS } from '../utils/samplePhotos';

interface CameraStudioProps {
  onCompleteShooting: (photos: string[]) => void;
  classNameInput: string;
  setClassNameInput: (name: string) => void;
}

const POSE_HINTS = [
  { step: 1, title: '첫 번째 컷: 환한 미소', desc: '치즈~ 김치~ 활짝 웃어보세요!', emoji: '😄' },
  { step: 2, title: '두 번째 컷: 예쁜 꽃받침', desc: '두 볼에 손을 대고 꽃받침 쏙!', emoji: '🌸' },
  { step: 3, title: '세 번째 컷: 사랑의 손하트', desc: '선생님과 친구들에게 손하트 뿅!', emoji: '💖' },
  { step: 4, title: '네 번째 컷: 신나는 브이', desc: '양손 번쩍! 깜찍한 브이 포즈!', emoji: '✌️' },
  { step: 5, title: '다섯 번째 컷: 자유 개구쟁이', desc: '내가 가장 좋아하는 엉뚱 표정!', emoji: '🤪' },
];

export const CameraStudio: React.FC<CameraStudioProps> = ({
  onCompleteShooting,
  classNameInput,
  setClassNameInput,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMirrored, setIsMirrored] = useState<boolean>(true);

  // Shooting session state
  const [isShooting, setIsShooting] = useState<boolean>(false);
  const [currentShotIndex, setCurrentShotIndex] = useState<number>(0); // 0 to 4
  const [countdown, setCountdown] = useState<number | null>(null); // 3, 2, 1, or null
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [autoPacing, setAutoPacing] = useState<boolean>(true);

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      setCameraError(null);
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setHasCamera(true);
    } catch (err) {
      console.warn('Camera access error:', err);
      setHasCamera(false);
      setCameraError('카메라를 찾을 수 없거나 권한이 필요합니다. 샘플 사진이나 파일 업로드를 이용하실 수 있습니다.');
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startCamera]);

  // Capture current video frame to high-res data URL
  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (isMirrored && facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.95);
  }, [isMirrored, facingMode]);

  // Automated 5-shot shooting sequence
  const startFiveShotSession = () => {
    setCapturedPhotos([]);
    setCurrentShotIndex(0);
    setIsShooting(true);
    runShotCountdown(0, []);
  };

  const runShotCountdown = (shotIdx: number, currentList: string[]) => {
    setCurrentShotIndex(shotIdx);

    // 3 seconds countdown
    let count = 3;
    setCountdown(count);
    soundEffects.playCountdown(count);

    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        soundEffects.playCountdown(count);
      } else {
        clearInterval(timer);
        setCountdown(null);

        // Flash and shutter
        setIsFlashing(true);
        soundEffects.playShutter();
        setTimeout(() => setIsFlashing(false), 200);

        // Capture photo
        let photoData = captureFrame();
        if (!photoData) {
          // Fallback to sample photo if camera not rendering
          photoData = SAMPLE_PHOTOS[shotIdx % SAMPLE_PHOTOS.length];
        }

        const nextList = [...currentList, photoData];
        setCapturedPhotos(nextList);

        // Check if finished 5 photos
        if (shotIdx + 1 < 5) {
          // Pause 1.8s between shots for kids to strike the next pose
          setTimeout(() => {
            runShotCountdown(shotIdx + 1, nextList);
          }, 1800);
        } else {
          // Finished all 5!
          setTimeout(() => {
            soundEffects.playFanfare();
            setIsShooting(false);
            onCompleteShooting(nextList);
          }, 1000);
        }
      }
    }, 1000);
  };

  // Upload custom photos fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const readers: Promise<string>[] = Array.from(files).slice(0, 5).map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((results) => {
      // If user uploaded fewer than 5 photos, pad with sample photos so there's always 5 to choose from
      let fullList = [...results];
      while (fullList.length < 5) {
        fullList.push(SAMPLE_PHOTOS[fullList.length]);
      }
      soundEffects.playFanfare();
      onCompleteShooting(fullList);
    });
  };

  // Use Built-in Kindergarten Samples
  const handleUseSamplePhotos = () => {
    soundEffects.playPop();
    onCompleteShooting(SAMPLE_PHOTOS);
  };

  const currentPose = POSE_HINTS[currentShotIndex] || POSE_HINTS[0];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-8 flex flex-col items-center">
      {/* Studio Banner & Class Name Setting */}
      <div className="w-full bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-white flex items-center justify-center text-2xl shadow-sm">
            📸
          </div>
          <div>
            <h1 className="font-jua text-xl sm:text-2xl text-amber-950 flex items-center gap-2">
              우리반 네컷 스튜디오
              <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-sans">
                3초 카운트다운 · 총 5장 촬영
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-amber-800/80 mt-0.5">
              3, 2, 1 카운트다운에 맞춰 신나게 포즈를 취해보세요! 총 5장을 찍고 제일 예쁜 4장을 고릅니다.
            </p>
          </div>
        </div>

        {/* Kindergarten / Class Name Input */}
        <div className="w-full sm:w-auto flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-amber-200">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">우리반 이름:</span>
          <input
            type="text"
            value={classNameInput}
            onChange={(e) => setClassNameInput(e.target.value)}
            placeholder="예: 햇살가득 햇님반"
            className="text-sm font-jua text-amber-900 focus:outline-none w-36 sm:w-44 placeholder:font-sans placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Main Camera Viewport Area */}
      <div className="w-full relative aspect-4/3 max-w-3xl bg-slate-900 rounded-3xl overflow-hidden shadow-xl border-4 border-amber-200">
        {/* Flash screen effect */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-30 pointer-events-none animate-ping" />
        )}

        {/* Video feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${
            isMirrored && facingMode === 'user' ? '-scale-x-100' : ''
          }`}
        />

        {/* If camera is not available */}
        {!hasCamera && (
          <div className="absolute inset-0 bg-slate-800 text-white flex flex-col items-center justify-center p-6 text-center z-10">
            <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
            <h3 className="font-jua text-xl mb-1">카메라를 준비하는 중이거나 권한이 필요합니다</h3>
            <p className="text-sm text-slate-300 max-w-md mb-6">
              카메라 권한을 허용해주시거나, 미리 준비된 귀여운 유치원 샘플 사진 또는 가지고 계신 사진 파일로 네컷 사진을 만들어보세요!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleUseSamplePhotos}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>귀여운 샘플 5장으로 바로 만들기</span>
              </button>
              <label className="cursor-pointer px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 transition-colors flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>사진 파일 업로드</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Live Grid Guidelines for Kids */}
        {!isShooting && hasCamera && (
          <div className="absolute inset-0 pointer-events-none border border-white/20 grid grid-cols-3 grid-rows-3">
            <div className="border-r border-b border-white/10" />
            <div className="border-r border-b border-white/10 flex items-center justify-center">
              <div className="w-32 h-40 rounded-full border-2 border-dashed border-amber-300/40" />
            </div>
            <div className="border-b border-white/10" />
            <div className="border-r border-b border-white/10" />
            <div className="border-r border-b border-white/10" />
            <div className="border-b border-white/10" />
            <div className="border-r border-white/10" />
            <div className="border-r border-white/10" />
            <div />
          </div>
        )}

        {/* Big Countdown Overlay (3, 2, 1) */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center z-20">
            <div className="relative">
              <span className="font-jua text-8xl sm:text-9xl text-amber-300 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] animate-bounce inline-block">
                {countdown}
              </span>
            </div>
            <div className="mt-4 bg-amber-500/90 text-white px-6 py-2 rounded-full font-jua text-xl sm:text-2xl shadow-lg">
              {currentPose.desc}
            </div>
          </div>
        )}

        {/* Shooting In-Progress Pose Bar Top */}
        {isShooting && (
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2.5 text-white">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentPose.emoji}</span>
              <div>
                <div className="font-jua text-sm sm:text-base text-amber-300">
                  {currentShotIndex + 1}/5번째 컷 촬영 중: {currentPose.title}
                </div>
                <div className="text-xs text-slate-200">{currentPose.desc}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i < capturedPhotos.length
                      ? 'bg-emerald-400 scale-110'
                      : i === currentShotIndex
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Camera Quick Controls (Switch camera, Mirror) */}
        {!isShooting && hasCamera && (
          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMirrored(!isMirrored)}
              className="p-2.5 bg-black/50 hover:bg-black/70 text-white rounded-xl backdrop-blur-md transition-colors text-xs flex items-center gap-1"
              title="거울 모드 반전"
            >
              <span>{isMirrored ? '거울 켬' : '거울 끔'}</span>
            </button>
            <button
              type="button"
              onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
              className="p-2.5 bg-black/50 hover:bg-black/70 text-white rounded-xl backdrop-blur-md transition-colors"
              title="카메라 전환"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Action Deck */}
      <div className="w-full max-w-3xl mt-6 flex flex-col items-center gap-4">
        {!isShooting ? (
          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={startFiveShotSession}
              disabled={isShooting}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-jua text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Camera className="w-7 h-7" />
              <span>촬영 시작하기 (3초 카운트다운 · 총 5장)</span>
            </button>

            <button
              type="button"
              onClick={handleUseSamplePhotos}
              className="w-full sm:w-auto px-5 py-4 bg-amber-100 hover:bg-amber-200 text-amber-900 font-jua text-base rounded-2xl transition-colors flex items-center justify-center gap-2 border border-amber-200"
            >
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>귀여운 샘플로 바로 체험</span>
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="font-jua text-amber-800 text-lg flex items-center justify-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <span>사진 촬영이 진행 중입니다. 카메라를 보며 방긋 웃어보세요!</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              총 5장의 촬영이 완료되면 베스트 4장을 선택하는 화면으로 이동합니다.
            </div>
          </div>
        )}

        {/* Captured Thumbnails Strip while in progress */}
        {capturedPhotos.length > 0 && (
          <div className="w-full bg-white border border-amber-200 rounded-2xl p-3 flex items-center gap-3 overflow-x-auto shadow-xs">
            <span className="text-xs font-semibold text-amber-900 whitespace-nowrap pl-2">
              촬영된 사진 ({capturedPhotos.length}/5):
            </span>
            <div className="flex items-center gap-2">
              {capturedPhotos.map((src, idx) => (
                <div
                  key={idx}
                  className="relative w-16 h-12 rounded-lg overflow-hidden border border-amber-300 shadow-xs shrink-0"
                >
                  <img src={src} alt={`Shot ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0.5 right-1 text-[10px] bg-black/60 text-white px-1 rounded-sm">
                    {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Helpful Pose Guide Cards for Kids and Teachers */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mt-2">
          {POSE_HINTS.map((pose) => (
            <div
              key={pose.step}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                isShooting && currentShotIndex + 1 === pose.step
                  ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-300 scale-102'
                  : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="text-2xl mb-1">{pose.emoji}</div>
              <div className="font-jua text-xs text-amber-950 font-bold">{pose.title}</div>
              <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{pose.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
