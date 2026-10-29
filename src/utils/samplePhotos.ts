// Generates adorable SVG data URLs for sample kindergarten photos
function createSampleAvatar(bg: string, character: string, label: string, accessory: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="800" height="600">
    <defs>
      <linearGradient id="grad-${bg.replace(/[^a-z0-9]/gi, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg}" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.2" />
      </linearGradient>
    </defs>
    <!-- Background -->
    <rect width="100%" height="100%" fill="${bg}" />
    <circle cx="60" cy="50" r="35" fill="white" opacity="0.25" />
    <circle cx="340" cy="240" r="45" fill="white" opacity="0.2" />
    <circle cx="330" cy="60" r="25" fill="white" opacity="0.3" />

    <!-- Cute Garland / Bunting at top -->
    <path d="M 0 25 Q 100 45 200 25 Q 300 45 400 25" stroke="rgba(255,255,255,0.7)" stroke-width="2" fill="none" />
    <polygon points="50,30 70,32 60,55" fill="#FFB703" />
    <polygon points="120,35 140,36 130,60" fill="#FB8500" />
    <polygon points="190,30 210,31 200,55" fill="#FF006E" />
    <polygon points="260,35 280,36 270,60" fill="#8338EC" />
    <polygon points="330,30 350,32 340,55" fill="#3A86FF" />

    <!-- Character Body -->
    <ellipse cx="200" cy="275" rx="100" ry="60" fill="#FFEAA7" />
    <ellipse cx="200" cy="275" rx="85" ry="50" fill="#FD79A8" />
    <path d="M 180 220 L 200 240 L 220 220 Z" fill="#FFEAA7" />

    <!-- Character Head -->
    <ellipse cx="200" cy="155" rx="75" ry="75" fill="#FFEAA7" />

    <!-- Cheeks blush -->
    <ellipse cx="150" cy="170" rx="14" ry="9" fill="#FF7675" opacity="0.65" />
    <ellipse cx="250" cy="170" rx="14" ry="9" fill="#FF7675" opacity="0.65" />

    <!-- Specific Character Features -->
    ${character}

    <!-- Accessories & Props -->
    ${accessory}

    <!-- Cute caption badge -->
    <rect x="25" y="245" width="160" height="34" rx="17" fill="rgba(0,0,0,0.3)" />
    <text x="105" y="267" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_PHOTOS: string[] = [
  // Photo 1: Smiling Sunshine Kid with party hat
  createSampleAvatar(
    '#FFEAA7',
    `<!-- Eyes -->
     <circle cx="170" cy="145" r="7" fill="#2D3436" />
     <circle cx="172" cy="143" r="2.5" fill="#ffffff" />
     <circle cx="230" cy="145" r="7" fill="#2D3436" />
     <circle cx="232" cy="143" r="2.5" fill="#ffffff" />
     <!-- Big smile -->
     <path d="M 175 168 Q 200 195 225 168" stroke="#2D3436" stroke-width="4.5" fill="#FF7675" stroke-linecap="round" />
     <!-- Hair -->
     <path d="M 130 140 C 130 90, 160 80, 200 80 C 240 80, 270 90, 270 140 C 255 110, 230 110, 200 115 C 170 110, 145 110, 130 140 Z" fill="#6C5CE7" />`,
    '1. 방긋방긋 활짝웃기 😊',
    `<!-- Party cone hat -->
     <polygon points="180,85 220,85 200,25" fill="#FF7675" />
     <circle cx="200" cy="23" r="7" fill="#FFEAA7" />
     <line x1="187" y1="65" x2="213" y2="65" stroke="#FFEAA7" stroke-width="3" />`
  ),

  // Photo 2: Bunny girl with flower cheeks (꽃받침)
  createSampleAvatar(
    '#FD79A8',
    `<!-- Bunny ears -->
     <ellipse cx="160" cy="60" rx="14" ry="40" fill="#FFFFFF" />
     <ellipse cx="160" cy="62" rx="7" ry="28" fill="#FFB8B8" />
     <ellipse cx="240" cy="60" rx="14" ry="40" fill="#FFFFFF" />
     <ellipse cx="240" cy="62" rx="7" ry="28" fill="#FFB8B8" />
     <!-- Eyes (winking) -->
     <path d="M 160 145 Q 170 135 180 145" stroke="#2D3436" stroke-width="4" fill="none" stroke-linecap="round" />
     <circle cx="230" cy="145" r="7" fill="#2D3436" />
     <circle cx="232" cy="143" r="2.5" fill="#ffffff" />
     <!-- Smile -->
     <path d="M 185 170 Q 200 185 215 170" stroke="#2D3436" stroke-width="3.5" fill="none" stroke-linecap="round" />
     <!-- Cute Flower hands under chin (꽃받침) -->
     <circle cx="165" cy="210" r="16" fill="#FFEAA7" />
     <circle cx="235" cy="210" r="16" fill="#FFEAA7" />
     <circle cx="200" cy="216" r="14" fill="#FF7675" />`,
    '2. 예쁜 꽃받침 포즈 🌸',
    `<!-- Flower in hair -->
     <circle cx="245" cy="105" r="9" fill="#FEEAA7" />
     <circle cx="245" cy="105" r="4" fill="#FF7675" />`
  ),

  // Photo 3: Bear boy with finger hearts (손하트)
  createSampleAvatar(
    '#74B9FF',
    `<!-- Bear ears -->
     <circle cx="140" cy="95" r="22" fill="#E17055" />
     <circle cx="140" cy="95" r="12" fill="#FFEAA7" />
     <circle cx="260" cy="95" r="22" fill="#E17055" />
     <circle cx="260" cy="95" r="12" fill="#FFEAA7" />
     <!-- Hair -->
     <path d="M 140 130 Q 200 90 260 130 Z" fill="#636E72" />
     <!-- Eyes -->
     <circle cx="170" cy="148" r="6" fill="#2D3436" />
     <circle cx="230" cy="148" r="6" fill="#2D3436" />
     <!-- Little Bear Nose & Smile -->
     <ellipse cx="200" cy="165" rx="14" ry="10" fill="#ffffff" />
     <circle cx="200" cy="160" r="4" fill="#2D3436" />
     <path d="M 194 167 Q 200 173 206 167" stroke="#2D3436" stroke-width="2.5" fill="none" stroke-linecap="round" />
     <!-- Finger Heart Hands -->
     <circle cx="200" cy="210" r="16" fill="#FFEAA7" />
     <path d="M 195 195 Q 200 185 205 195 Q 200 205 195 195 Z" fill="#FF4757" />`,
    '3. 사랑해요 손하트 💖',
    `<!-- Floating little hearts -->
     <path d="M 125 120 Q 130 110 135 120 Q 130 130 125 120 Z" fill="#FF6B81" />
     <path d="M 275 125 Q 280 115 285 125 Q 280 135 275 125 Z" fill="#FF6B81" />`
  ),

  // Photo 4: Peace sign with sunglasses (귀여운 브이!)
  createSampleAvatar(
    '#55EFC4',
    `<!-- Cool hair -->
     <path d="M 130 120 Q 160 70 200 70 Q 240 70 270 120 Z" fill="#2D3436" />
     <!-- Sunglasses -->
     <rect x="145" y="130" width="45" height="30" rx="8" fill="#2D3436" />
     <rect x="210" y="130" width="45" height="30" rx="8" fill="#2D3436" />
     <line x1="190" y1="145" x2="210" y2="145" stroke="#2D3436" stroke-width="4" />
     <line x1="150" y1="135" x2="185" y2="155" stroke="rgba(255,255,255,0.4)" stroke-width="3" />
     <line x1="215" y1="135" x2="250" y2="155" stroke="rgba(255,255,255,0.4)" stroke-width="3" />
     <!-- Big smile with tongue -->
     <path d="M 175 175 Q 200 200 225 175" stroke="#2D3436" stroke-width="4" fill="#FF7675" stroke-linecap="round" />
     <!-- Peace / V Sign Hand -->
     <rect x="110" y="150" width="16" height="35" rx="8" fill="#FFEAA7" transform="rotate(-20 110 150)" />
     <rect x="125" y="145" width="16" height="35" rx="8" fill="#FFEAA7" transform="rotate(10 125 145)" />`,
    '4. 멋쟁이 브이 포즈 ✌️',
    `<!-- Star glitter -->
     <polygon points="280,100 285,112 297,114 288,122 291,134 280,127 269,134 272,122 263,114 275,112" fill="#FFEAA7" />`
  ),

  // Photo 5: Mischievous silly cat pose (개구쟁이 윙크 포즈)
  createSampleAvatar(
    '#A29BFE',
    `<!-- Cat ears -->
     <polygon points="135,110 160,50 175,100" fill="#FD79A8" />
     <polygon points="142,105 160,65 170,98" fill="#FAB1A0" />
     <polygon points="265,110 240,50 225,100" fill="#FD79A8" />
     <polygon points="258,105 240,65 230,98" fill="#FAB1A0" />
     <!-- Cat whiskers -->
     <line x1="120" y1="165" x2="150" y2="160" stroke="#2D3436" stroke-width="3" stroke-linecap="round" />
     <line x1="120" y1="175" x2="150" y2="175" stroke="#2D3436" stroke-width="3" stroke-linecap="round" />
     <line x1="280" y1="165" x2="250" y2="160" stroke="#2D3436" stroke-width="3" stroke-linecap="round" />
     <line x1="280" y1="175" x2="250" y2="175" stroke="#2D3436" stroke-width="3" stroke-linecap="round" />
     <!-- Playful Wink Eyes -->
     <path d="M 160 145 Q 170 132 180 145" stroke="#2D3436" stroke-width="4.5" fill="none" stroke-linecap="round" />
     <circle cx="230" cy="145" r="8" fill="#2D3436" />
     <circle cx="233" cy="142" r="3" fill="#ffffff" />
     <!-- Silly tongue out smile -->
     <path d="M 180 170 Q 200 185 220 170" stroke="#2D3436" stroke-width="3.5" fill="none" stroke-linecap="round" />
     <path d="M 193 175 C 193 195 207 195 207 175 Z" fill="#FF7675" />`,
    '5. 야옹~ 개구쟁이 표정 🐱',
    `<!-- Musical notes -->
     <circle cx="280" cy="80" r="5" fill="#FFEAA7" />
     <line x1="285" y1="80" x2="285" y2="60" stroke="#FFEAA7" stroke-width="2.5" />`
  ),
];
