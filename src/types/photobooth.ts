export type Step = 'ready' | 'shooting' | 'selecting' | 'customizing';

export type LayoutMode = 'strip' | 'grid';

export type PhotoFilter = 'none' | 'bright' | 'warm' | 'vintage' | 'mono';

export interface FrameTheme {
  id: string;
  name: string;
  subName: string;
  bgClass: string;
  borderClass: string;
  textColor: string;
  subTextColor: string;
  accentColor: string;
  badgeBg: string;
  previewBg: string;
  decorations: 'sunshine' | 'sprout' | 'strawberry' | 'rainbow' | 'starlight' | 'crayon' | 'polaroid' | 'lavender';
}

export interface PlacedSticker {
  id: string;
  emoji: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number;
  rotation: number;
}

export interface StickerPreset {
  id: string;
  emoji: string;
  label: string;
}

export const STICKER_PRESETS: StickerPreset[] = [
  { id: 'heart', emoji: '💖', label: '하트' },
  { id: 'star', emoji: '⭐', label: '반짝별' },
  { id: 'crown', emoji: '👑', label: '왕관' },
  { id: 'sprout', emoji: '🌱', label: '새싹' },
  { id: 'flower', emoji: '🌸', label: '꽃' },
  { id: 'sun', emoji: '☀️', label: '햇님' },
  { id: 'ribbon', emoji: '🎀', label: '리본' },
  { id: 'party', emoji: '🎉', label: '파티' },
  { id: 'bear', emoji: '🧸', label: '곰돌이' },
  { id: 'bunny', emoji: '🐰', label: '토끼' },
  { id: 'rainbow', emoji: '🌈', label: '무지개' },
  { id: 'sunglasses', emoji: '😎', label: '선글라스' },
  { id: 'clap', emoji: '👏', label: '참잘했어요' },
  { id: 'crayon', emoji: '🖍️', label: '크레용' },
  { id: 'candy', emoji: '🍭', label: '사탕' },
  { id: 'cake', emoji: '🎂', label: '케이크' },
];

export const FRAME_THEMES: FrameTheme[] = [
  {
    id: 'sunshine',
    name: '햇살노랑반',
    subName: '따뜻한 햇살과 구름',
    bgClass: 'bg-[#FFF9DB]',
    borderClass: 'border-[#FFE066]',
    textColor: 'text-[#F59F00]',
    subTextColor: 'text-[#FAB005]',
    accentColor: '#F59F00',
    badgeBg: 'bg-[#FFF3BF] text-[#E67700]',
    previewBg: 'bg-[#FFE066]',
    decorations: 'sunshine',
  },
  {
    id: 'sprout',
    name: '새싹초록반',
    subName: '무럭무럭 자라는 꿈',
    bgClass: 'bg-[#EBFBEE]',
    borderClass: 'border-[#B2F2BB]',
    textColor: 'text-[#2B8A3E]',
    subTextColor: 'text-[#40C057]',
    accentColor: '#2B8A3E',
    badgeBg: 'bg-[#D3F9D8] text-[#2B8A3E]',
    previewBg: 'bg-[#8CE99A]',
    decorations: 'sprout',
  },
  {
    id: 'strawberry',
    name: '달콤딸기반',
    subName: '상큼하고 사랑스러운 분홍',
    bgClass: 'bg-[#FFF0F6]',
    borderClass: 'border-[#FFC9DB]',
    textColor: 'text-[#D6336C]',
    subTextColor: 'text-[#F06595]',
    accentColor: '#D6336C',
    badgeBg: 'bg-[#FFDEEB] text-[#C2255C]',
    previewBg: 'bg-[#FAA2C1]',
    decorations: 'strawberry',
  },
  {
    id: 'rainbow',
    name: '무지개하늘반',
    subName: '맑은 하늘과 둥실 구름',
    bgClass: 'bg-[#E7F5FF]',
    borderClass: 'border-[#A5D8FF]',
    textColor: 'text-[#1971C2]',
    subTextColor: 'text-[#339AF0]',
    accentColor: '#1971C2',
    badgeBg: 'bg-[#D0EBFF] text-[#1864AB]',
    previewBg: 'bg-[#74C0FC]',
    decorations: 'rainbow',
  },
  {
    id: 'lavender',
    name: '보라꽃밭반',
    subName: '향기로운 라벤더 이야기',
    bgClass: 'bg-[#F8F0FC]',
    borderClass: 'border-[#E599F7]',
    textColor: 'text-[#862E9C]',
    subTextColor: 'text-[#AE3EC9]',
    accentColor: '#862E9C',
    badgeBg: 'bg-[#F3D9FA] text-[#862E9C]',
    previewBg: 'bg-[#DA77F2]',
    decorations: 'lavender',
  },
  {
    id: 'starlight',
    name: '별빛밤하늘',
    subName: '반짝이는 밤하늘의 꿈',
    bgClass: 'bg-[#1A1E36]',
    borderClass: 'border-[#3B4261]',
    textColor: 'text-[#FFD43B]',
    subTextColor: 'text-[#91A7FF]',
    accentColor: '#FFD43B',
    badgeBg: 'bg-[#293056] text-[#FFD43B]',
    previewBg: 'bg-[#2E3856]',
    decorations: 'starlight',
  },
  {
    id: 'crayon',
    name: '크레용스케치',
    subName: '알록달록 스케치북',
    bgClass: 'bg-[#FAF8F5]',
    borderClass: 'border-[#E9ECEF]',
    textColor: 'text-[#E03131]',
    subTextColor: 'text-[#495057]',
    accentColor: '#E03131',
    badgeBg: 'bg-[#FFE3E3] text-[#C92A2A]',
    previewBg: 'bg-[#FF8787]',
    decorations: 'crayon',
  },
  {
    id: 'polaroid',
    name: '클래식아이보리',
    subName: '깔끔한 폴라로이드 감성',
    bgClass: 'bg-[#FDFBF7]',
    borderClass: 'border-[#E4DEC6]',
    textColor: 'text-[#343A40]',
    subTextColor: 'text-[#868E96]',
    accentColor: '#343A40',
    badgeBg: 'bg-[#F1ECE1] text-[#343A40]',
    previewBg: 'bg-[#EAE4D3]',
    decorations: 'polaroid',
  },
];
