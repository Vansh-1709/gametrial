import React from 'react';

interface SonosheeAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  dialogue?: string;
  mood?: 'confident' | 'excited' | 'shocked' | 'smug';
  className?: string;
}

export const SonosheeAvatar: React.FC<SonosheeAvatarProps> = ({
  size = 'md',
  dialogue,
  mood = 'confident',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-14 h-14',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48',
  };

  return (
    <div className={`relative flex items-center gap-3 ${className}`}>
      {/* Anime Portrait Container with Heavy Ink Comic Frame */}
      <div
        className={`${sizeMap[size]} relative shrink-0 rounded-2xl overflow-hidden border-[3.5px] border-black bg-gradient-to-b from-sky-400 via-teal-500 to-indigo-950 shadow-[4px_4px_0px_#000000]`}
      >
        {/* Cel-shaded Character SVG Illustration */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full object-cover transform scale-110 translate-y-1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Ink drop shadow filter */}
            <filter id="comic-ink" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="2" dy="2" stdDeviation="0" floodColor="#000000" floodOpacity="1" />
            </filter>
            {/* Linear gradients for cel-shading */}
            <linearGradient id="mint-hair" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bbf7d0" />
              <stop offset="45%" stopColor="#86efac" />
              <stop offset="85%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            <linearGradient id="skin-tone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
              <stop offset="30%" stopColor="#fde68a" />
              <stop offset="80%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fba988" />
            </linearGradient>
            <linearGradient id="cockpit-seat" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="60%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#0e7490" />
            </linearGradient>
            <radialGradient id="gem-sapphire" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="30%" stopColor="#0284c7" />
              <stop offset="80%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#030712" />
            </radialGradient>
          </defs>

          {/* Background Cockpit Bolsters (Turquoise / Cyan from screenshot) */}
          <path
            d="M 5,200 Q 20,110 50,115 Q 85,120 95,150 L 5,200 Z"
            fill="url(#cockpit-seat)"
            stroke="#000"
            strokeWidth="3.5"
          />
          <path
            d="M 195,200 Q 180,110 150,115 Q 115,120 105,150 L 195,200 Z"
            fill="url(#cockpit-seat)"
            stroke="#000"
            strokeWidth="3.5"
          />
          {/* Seat specular highlight */}
          <path
            d="M 25,125 Q 45,118 60,122"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 175,125 Q 155,118 140,122"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Shoulders & Chest */}
          <path
            d="M 60,175 Q 100,180 140,175 L 148,200 L 52,200 Z"
            fill="url(#skin-tone)"
            stroke="#000"
            strokeWidth="3.5"
          />
          {/* Dress / Top (Hot Pink Frill from screenshot) */}
          <path
            d="M 68,185 Q 100,192 132,185 Q 140,200 140,200 L 60,200 Z"
            fill="#ec4899"
            stroke="#000"
            strokeWidth="3"
          />
          {/* Frill trim */}
          <path
            d="M 68,185 Q 75,180 82,185 Q 90,180 98,185 Q 106,180 114,185 Q 122,180 132,185"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
          />

          {/* Neck */}
          <path
            d="M 87,135 L 85,175 Q 100,178 115,175 L 113,135 Z"
            fill="url(#skin-tone)"
            stroke="#000"
            strokeWidth="3.5"
          />
          {/* Heavy Neck Ink Shadow (Anime signature) */}
          <path
            d="M 87,138 Q 100,146 113,138 L 110,154 Q 100,160 90,154 Z"
            fill="#09090b"
          />

          {/* Pink Ribbon Shoulder Bows */}
          <g stroke="#000" strokeWidth="2.5">
            {/* Left Bow loops */}
            <path d="M 68,172 C 40,135 48,160 62,175" fill="#f43f5e" />
            <path d="M 66,174 C 45,185 52,205 72,182" fill="#f43f5e" />
            {/* Right Bow loops */}
            <path d="M 132,172 C 160,135 152,160 138,175" fill="#f43f5e" />
            <path d="M 134,174 C 155,185 148,205 128,182" fill="#f43f5e" />
          </g>

          {/* Sapphire Jewel Necklace */}
          <path
            d="M 86,165 Q 100,178 114,165"
            stroke="#ec4899"
            strokeWidth="2.5"
            fill="none"
          />
          {/* Oval Gem Mount */}
          <ellipse cx="100" cy="176" rx="8" ry="9" fill="#000" />
          <ellipse cx="100" cy="176" rx="6.5" ry="7.5" fill="url(#gem-sapphire)" />
          {/* Gem sparkle highlight */}
          <ellipse cx="98" cy="173" rx="2" ry="2.5" fill="#ffffff" />

          {/* Face Contour */}
          <path
            d="M 72,95 Q 68,125 80,140 Q 95,152 100,153 Q 105,152 120,140 Q 132,125 128,95 Z"
            fill="url(#skin-tone)"
            stroke="#000"
            strokeWidth="3.5"
          />

          {/* Ears */}
          <path d="M 69,112 Q 62,118 69,126 Z" fill="#fed7aa" stroke="#000" strokeWidth="2.5" />
          <path d="M 131,112 Q 138,118 131,126 Z" fill="#fed7aa" stroke="#000" strokeWidth="2.5" />

          {/* Golden Head Orbs / Bells at Top */}
          <circle cx="86" cy="46" r="14" fill="#facc15" stroke="#000" strokeWidth="3" />
          <circle cx="114" cy="46" r="14" fill="#facc15" stroke="#000" strokeWidth="3" />
          <path d="M 82,42 Q 86,38 90,42" stroke="#ffffff" strokeWidth="2.5" fill="none" />
          <path d="M 110,42 Q 114,38 118,42" stroke="#ffffff" strokeWidth="2.5" fill="none" />

          {/* Mint Green Hair (Back Layers) */}
          <path
            d="M 64,80 Q 56,120 72,145 Q 60,115 62,88 Z"
            fill="#15803d"
            stroke="#000"
            strokeWidth="2.5"
          />
          <path
            d="M 136,80 Q 144,120 128,145 Q 140,115 138,88 Z"
            fill="#15803d"
            stroke="#000"
            strokeWidth="2.5"
          />

          {/* Eyes (Bold manga lashes, emerald iris, white specular reflections) */}
          {/* Left Eye */}
          <g>
            {/* Eye white */}
            <path d="M 78,115 Q 86,108 94,115 Q 86,122 78,115 Z" fill="#ffffff" />
            {/* Emerald Iris */}
            <ellipse cx="86" cy="115" rx="5" ry="5.5" fill="#10b981" />
            <ellipse cx="86" cy="115" rx="3" ry="3.5" fill="#064e3b" />
            <circle cx="84.5" cy="113" r="1.5" fill="#ffffff" />
            {/* Bold black upper lash line */}
            <path
              d="M 76,114 Q 85,106 96,113"
              stroke="#000"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Lower subtle lash */}
            <path d="M 80,118 Q 86,121 92,118" stroke="#000" strokeWidth="1.5" fill="none" />
          </g>

          {/* Right Eye */}
          <g>
            {/* Eye white */}
            <path d="M 106,115 Q 114,108 122,115 Q 114,122 106,115 Z" fill="#ffffff" />
            {/* Emerald Iris */}
            <ellipse cx="114" cy="115" rx="5" ry="5.5" fill="#10b981" />
            <ellipse cx="114" cy="115" rx="3" ry="3.5" fill="#064e3b" />
            <circle cx="112.5" cy="113" r="1.5" fill="#ffffff" />
            {/* Bold black upper lash line */}
            <path
              d="M 104,113 Q 115,106 124,114"
              stroke="#000"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Lower subtle lash */}
            <path d="M 108,118 Q 114,121 120,118" stroke="#000" strokeWidth="1.5" fill="none" />
          </g>

          {/* Eyebrows */}
          <path d="M 78,105 Q 86,102 94,106" stroke="#166534" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 106,106 Q 114,102 122,105" stroke="#166534" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Nose (Subtle anime dot/line) */}
          <path d="M 99,124 L 101,127" stroke="#000" strokeWidth="2" strokeLinecap="round" />

          {/* Mouth (Determined / Open anime racing expression) */}
          {mood === 'shocked' ? (
            <ellipse cx="100" cy="138" rx="4.5" ry="6" fill="#be185d" stroke="#000" strokeWidth="2" />
          ) : mood === 'excited' ? (
            <path
              d="M 94,135 Q 100,146 106,135 Z"
              fill="#ec4899"
              stroke="#000"
              strokeWidth="2.5"
            />
          ) : (
            <g>
              <path
                d="M 96,136 Q 100,140 105,137"
                stroke="#000"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <path d="M 98,137 Q 100,139 103,138" stroke="#ec4899" strokeWidth="1.5" fill="none" />
            </g>
          )}

          {/* Front Mint Green Hair with Styled Bangs (Exact style from screenshot) */}
          <path
            d="M 66,75 Q 60,95 62,118 Q 72,110 76,96 Q 84,116 98,90 Q 104,114 116,92 Q 124,112 134,116 Q 138,92 134,75 Q 120,52 100,50 Q 80,52 66,75 Z"
            fill="url(#mint-hair)"
            stroke="#000"
            strokeWidth="3.5"
          />

          {/* Center Bang parting with highlight */}
          <path
            d="M 92,62 Q 98,82 102,96"
            stroke="#000"
            strokeWidth="2.5"
            fill="none"
          />
          {/* Hair Anime Specular Sheen (Arching white glow) */}
          <path
            d="M 78,66 Q 98,58 122,66"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
        </svg>

        {/* Comic Speedline Accent in Corner */}
        <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-yellow-400 border border-black font-mono font-black text-[9px] text-black tracking-widest uppercase rotate-3 shadow-[1px_1px_0px_#000]">
          SONOSHEE
        </div>
      </div>

      {/* Comic Dialogue Balloon (If provided) */}
      {dialogue && (
        <div className="relative flex-1 bg-yellow-300 border-[3px] border-black rounded-xl p-2.5 shadow-[4px_4px_0px_#000000] text-black">
          {/* Comic speech bubble tail */}
          <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-r-[10px] border-r-black" />
          <div className="absolute top-1/2 -left-[7px] -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[8px] border-r-yellow-300" />

          <p className="font-['Chakra_Petch',sans-serif] font-bold text-xs sm:text-sm tracking-wide leading-snug">
            "{dialogue}"
          </p>
        </div>
      )}
    </div>
  );
};
