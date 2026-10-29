import { FrameTheme, LayoutMode, PhotoFilter, PlacedSticker } from '../types/photobooth';

// Loads an image from string (data URL or object URL)
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

interface RenderOptions {
  photos: string[]; // exactly 4 photo URLs
  theme: FrameTheme;
  layout: LayoutMode;
  filter: PhotoFilter;
  title: string;
  subtitle: string;
  dateStr: string;
  stickers: PlacedSticker[];
}

export async function renderPhotoboothToCanvas(
  canvas: HTMLCanvasElement,
  options: RenderOptions
): Promise<void> {
  const { photos, theme, layout, filter, title, subtitle, dateStr, stickers } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Calculate canvas dimensions based on layout:
  // Strip: 800 x 2400 (Ultra clear 4-cut vertical strip)
  // Grid: 1400 x 1400 (2x2 square)
  const isStrip = layout === 'strip';
  const width = isStrip ? 800 : 1400;
  const height = isStrip ? 2400 : 1400;

  canvas.width = width;
  canvas.height = height;

  // 1. Draw Frame Background
  ctx.save();
  ctx.fillStyle = getThemeBgHex(theme.id);
  ctx.fillRect(0, 0, width, height);

  // Background subtle pattern or theme illustration
  drawThemeBackgroundArt(ctx, theme.decorations, width, height);
  ctx.restore();

  // 2. Load 4 images
  const loadedImages: (HTMLImageElement | null)[] = await Promise.all(
    photos.map((src) =>
      loadImage(src).catch(() => null)
    )
  );

  // 3. Define photo slots
  const photoPadding = isStrip ? 40 : 50;
  const topMargin = isStrip ? 140 : 130;
  const bottomMargin = isStrip ? 260 : 180;

  type Slot = { x: number; y: number; w: number; h: number };
  const slots: Slot[] = [];

  if (isStrip) {
    const availableHeight = height - topMargin - bottomMargin;
    const slotGap = 35;
    const slotH = (availableHeight - slotGap * 3) / 4;
    const slotW = width - photoPadding * 2;

    for (let i = 0; i < 4; i++) {
      slots.push({
        x: photoPadding,
        y: topMargin + i * (slotH + slotGap),
        w: slotW,
        h: slotH,
      });
    }
  } else {
    // 2x2 Grid
    const availableWidth = width - photoPadding * 2;
    const availableHeight = height - topMargin - bottomMargin;
    const slotGap = 36;
    const slotW = (availableWidth - slotGap) / 2;
    const slotH = (availableHeight - slotGap) / 2;

    slots.push(
      { x: photoPadding, y: topMargin, w: slotW, h: slotH },
      { x: photoPadding + slotW + slotGap, y: topMargin, w: slotW, h: slotH },
      { x: photoPadding, y: topMargin + slotH + slotGap, w: slotW, h: slotH },
      { x: photoPadding + slotW + slotGap, y: topMargin + slotH + slotGap, w: slotW, h: slotH }
    );
  }

  // 4. Draw each photo with rounded corners and applied filter
  const photoRadius = 24;

  for (let i = 0; i < 4; i++) {
    const slot = slots[i];
    const img = loadedImages[i];

    ctx.save();
    // Clip rounded rectangle
    roundRect(ctx, slot.x, slot.y, slot.w, slot.h, photoRadius);
    ctx.clip();

    // Fill white card background under photo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(slot.x, slot.y, slot.w, slot.h);

    if (img) {
      // Draw image object-fit: cover
      drawImageCover(ctx, img, slot.x, slot.y, slot.w, slot.h);

      // Apply Filter overlay
      applyCanvasFilter(ctx, filter, slot.x, slot.y, slot.w, slot.h);
    }

    ctx.restore();

    // Draw photo border
    ctx.save();
    ctx.strokeStyle = theme.id === 'starlight' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 4;
    roundRect(ctx, slot.x, slot.y, slot.w, slot.h, photoRadius);
    ctx.stroke();
    ctx.restore();

    // Cute small photo index badge in top-left
    ctx.save();
    ctx.fillStyle = theme.id === 'starlight' ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(slot.x + 36, slot.y + 36, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = theme.id === 'starlight' ? '#FFD43B' : theme.accentColor;
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${i + 1}`, slot.x + 36, slot.y + 37);
    ctx.restore();
  }

  // 5. Draw Header and Footer Details
  ctx.save();
  drawPhotoboothTypography(ctx, {
    width,
    height,
    isStrip,
    topMargin,
    bottomMargin,
    theme,
    title,
    subtitle,
    dateStr,
  });
  ctx.restore();

  // 6. Draw Placed Stickers
  ctx.save();
  for (const sticker of stickers) {
    const posX = (sticker.x / 100) * width;
    const posY = (sticker.y / 100) * height;
    const size = 70 * sticker.scale;

    ctx.save();
    ctx.translate(posX, posY);
    ctx.rotate((sticker.rotation * Math.PI) / 180);
    ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sticker.emoji, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

// Background Theme Colors
function getThemeBgHex(themeId: string): string {
  switch (themeId) {
    case 'sunshine':
      return '#FFF9DB';
    case 'sprout':
      return '#EBFBEE';
    case 'strawberry':
      return '#FFF0F6';
    case 'rainbow':
      return '#E7F5FF';
    case 'lavender':
      return '#F8F0FC';
    case 'starlight':
      return '#1A1E36';
    case 'crayon':
      return '#FAF8F5';
    case 'polaroid':
    default:
      return '#FDFBF7';
  }
}

// Draw themed decorative background drawings
function drawThemeBackgroundArt(
  ctx: CanvasRenderingContext2D,
  deco: string,
  w: number,
  h: number
) {
  if (deco === 'sunshine') {
    // Cute sun in top right
    ctx.fillStyle = '#FFE066';
    ctx.beginPath();
    ctx.arc(w - 70, 70, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FAB005';
    ctx.beginPath();
    ctx.arc(w - 70, 70, 24, 0, Math.PI * 2);
    ctx.fill();
  } else if (deco === 'sprout') {
    // Cute sprouts bottom
    ctx.fillStyle = '#B2F2BB';
    ctx.beginPath();
    ctx.arc(60, 60, 30, 0, Math.PI * 2);
    ctx.fill();
  } else if (deco === 'starlight') {
    // Little glowing stars in corners
    ctx.fillStyle = '#FFD43B';
    const stars = [
      { x: 50, y: 50, r: 4 },
      { x: 120, y: 70, r: 6 },
      { x: w - 80, y: 60, r: 5 },
      { x: w - 140, y: 90, r: 3 },
      { x: 70, y: h - 100, r: 5 },
      { x: w - 70, y: h - 90, r: 6 },
    ];
    for (const s of stars) {
      drawStar(ctx, s.x, s.y, 4, s.r * 2.2, s.r);
    }
  } else if (deco === 'crayon') {
    // Playful crayon border strokes
    ctx.strokeStyle = '#FF8787';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(30, 20);
    ctx.lineTo(150, 20);
    ctx.stroke();

    ctx.strokeStyle = '#4DABF7';
    ctx.beginPath();
    ctx.moveTo(w - 180, 20);
    ctx.lineTo(w - 30, 20);
    ctx.stroke();
  }
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

function drawPhotoboothTypography(
  ctx: CanvasRenderingContext2D,
  info: {
    width: number;
    height: number;
    isStrip: boolean;
    topMargin: number;
    bottomMargin: number;
    theme: FrameTheme;
    title: string;
    subtitle: string;
    dateStr: string;
  }
) {
  const { width, height, isStrip, theme, title, subtitle, dateStr } = info;
  const isDark = theme.id === 'starlight';

  // 1. Top Header
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Cute Category Badge / Subtitle at top
  const headerY = isStrip ? 75 : 68;

  ctx.font = 'bold 36px "JoseonGulim", "Jua", "Gaegu", sans-serif';
  ctx.fillStyle = isDark ? '#FFFFFF' : theme.accentColor;
  ctx.fillText(title || '우리반 네컷', width / 2, headerY);

  if (subtitle) {
    ctx.font = '22px "JoseonGulim", "Jua", "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = isDark ? '#91A7FF' : '#868E96';
    ctx.fillText(subtitle, width / 2, headerY + 36);
  }

  // 2. Bottom Footer (Classic Life-Four-Cuts bar)
  const footerBaseY = height - (isStrip ? 140 : 100);

  // Decorative divider line
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, footerBaseY - 30);
  ctx.lineTo(width - 100, footerBaseY - 30);
  ctx.stroke();

  // Kindergarten / Studio Brand Logo
  ctx.font = 'bold 38px "JoseonGulim", "Jua", sans-serif';
  ctx.fillStyle = isDark ? '#FFD43B' : theme.accentColor;
  ctx.fillText('✨ 우리들의 소중한 오늘 ✨', width / 2, footerBaseY + 12);

  // Date and Class Mark
  ctx.font = '22px "Plus Jakarta Sans", "Jua", sans-serif';
  ctx.fillStyle = isDark ? '#C5D1F7' : '#495057';
  ctx.fillText(dateStr || '2026. 10. 29', width / 2, footerBaseY + 54);

  // Tiny cute photobooth strip icon text
  ctx.font = '16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = isDark ? '#6C7AAB' : '#ADB5BD';
  ctx.fillText('OUR CLASS 4-CUTS PHOTOBOOTH', width / 2, footerBaseY + 84);
}

// Utility: Draw Image Cover (aspect ratio preserved)
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;

  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;

  if (imgRatio > targetRatio) {
    sw = img.height * targetRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / targetRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

// Canvas Filter Effects
function applyCanvasFilter(
  ctx: CanvasRenderingContext2D,
  filter: PhotoFilter,
  x: number,
  y: number,
  w: number,
  h: number
) {
  if (filter === 'none') return;

  if (filter === 'bright') {
    // 뽀샤시 Glow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255, 230, 240, 0.08)';
    ctx.fillRect(x, y, w, h);
  } else if (filter === 'warm') {
    // 따뜻한 햇살
    ctx.fillStyle = 'rgba(255, 180, 50, 0.14)';
    ctx.fillRect(x, y, w, h);
  } else if (filter === 'vintage') {
    // 레트로 빈티지
    ctx.fillStyle = 'rgba(215, 175, 110, 0.18)';
    ctx.fillRect(x, y, w, h);
  } else if (filter === 'mono') {
    // 흑백 (Desaturate via compositing)
    ctx.save();
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = '#808080';
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }
}

// Utility: Rounded Rect
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
