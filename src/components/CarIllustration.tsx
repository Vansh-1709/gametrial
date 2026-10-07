import React from 'react';

interface CarIllustrationProps {
  carId: string;
  color?: string;
  accentColor?: string;
  view?: 'top' | 'rear' | 'angle';
  isNitroActive?: boolean;
  className?: string;
  wheelTurnAngle?: number; // -1 to 1 for steering animation
}

export const CarIllustration: React.FC<CarIllustrationProps> = ({
  carId,
  color = '#10b981',
  accentColor = '#064e3b',
  view = 'rear',
  isNitroActive = false,
  className = '',
  wheelTurnAngle = 0,
}) => {
  // Steer rotation in degrees
  const steerDeg = wheelTurnAngle * 18;

  if (view === 'rear') {
    return (
      <div className={`relative ${className}`}>
        <svg
          viewBox="0 0 160 120"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`car-body-${carId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} />
              <stop offset="60%" stopColor={color} />
              <stop offset="100%" stopColor={accentColor} />
            </linearGradient>
            <linearGradient id="window-glare" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0891b2" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <radialGradient id="nitro-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="40%" stopColor="#06b6d4" />
              <stop offset="80%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Underbody Shadow (Heavy Manga Ink) */}
          <ellipse cx="80" cy="108" rx="66" ry="12" fill="#000000" opacity="0.9" />

          {/* Nitro Afterburner Flames (Active when boosting) */}
          {isNitroActive && (
            <g className="animate-pulse">
              {/* Left Jet */}
              <ellipse cx="62" cy="108" rx="8" ry="16" fill="url(#nitro-glow)" transform="rotate(180 62 108)" />
              <path d="M 58,102 Q 62,130 66,102 Z" fill="#38bdf8" />
              <path d="M 60,102 Q 62,122 64,102 Z" fill="#ffffff" />
              {/* Right Jet */}
              <ellipse cx="98" cy="108" rx="8" ry="16" fill="url(#nitro-glow)" transform="rotate(180 98 108)" />
              <path d="M 94,102 Q 98,130 102,102 Z" fill="#38bdf8" />
              <path d="M 96,102 Q 98,122 100,102 Z" fill="#ffffff" />
            </g>
          )}

          {/* Rear Wheels / Wide Slicks */}
          <g>
            {/* Left Wheel */}
            <rect
              x="16"
              y="72"
              width="22"
              height="36"
              rx="6"
              fill="#18181b"
              stroke="#000"
              strokeWidth="3.5"
            />
            {/* Tire Tread lines */}
            <path d="M 18,84 L 36,84 M 18,94 L 36,94" stroke="#3f3f46" strokeWidth="2.5" />

            {/* Right Wheel */}
            <rect
              x="122"
              y="72"
              width="22"
              height="36"
              rx="6"
              fill="#18181b"
              stroke="#000"
              strokeWidth="3.5"
            />
            <path d="M 124,84 L 142,84 M 124,94 L 142,94" stroke="#3f3f46" strokeWidth="2.5" />
          </g>

          {/* Lower Diffuser Fins */}
          <path
            d="M 38,98 L 122,98 L 118,108 L 42,108 Z"
            fill="#111827"
            stroke="#000"
            strokeWidth="3"
          />
          <line x1="56" y1="98" x2="56" y2="108" stroke="#000" strokeWidth="3" />
          <line x1="72" y1="98" x2="72" y2="108" stroke="#000" strokeWidth="3" />
          <line x1="88" y1="98" x2="88" y2="108" stroke="#000" strokeWidth="3" />
          <line x1="104" y1="98" x2="104" y2="108" stroke="#000" strokeWidth="3" />

          {/* Main Car Body Shell */}
          <path
            d="M 28,94 C 24,70 34,54 44,50 C 52,47 108,47 116,50 C 126,54 136,70 132,94 C 130,102 122,104 116,104 L 44,104 C 38,104 30,102 28,94 Z"
            fill={`url(#car-body-${carId})`}
            stroke="#000000"
            strokeWidth="3.5"
          />

          {/* High-Contrast Comic Cel-Shade Crease Lines */}
          <path
            d="M 40,68 Q 80,73 120,68"
            stroke="#000000"
            strokeWidth="3"
            fill="none"
          />
          {/* Specular Edge Highlight */}
          <path
            d="M 46,54 Q 80,51 114,54"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />

          {/* Cabin / Canopy / Rear Window */}
          <path
            d="M 52,50 C 56,26 62,20 80,20 C 98,20 104,26 108,50 Z"
            fill="url(#window-glare)"
            stroke="#000"
            strokeWidth="3.5"
          />
          {/* Canopy Glare Sheen */}
          <path
            d="M 62,44 L 72,24"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Car-Specific Features */}
          {carId === 'gt3_rs' && (
            /* Porsche 911 GT3 RS: Giant Swan-Neck Aero Wing */
            <g>
              {/* Wing Struts */}
              <path d="M 54,48 L 50,14 L 56,14 L 58,48 Z" fill="#000" />
              <path d="M 106,48 L 110,14 L 104,14 L 102,48 Z" fill="#000" />
              {/* Massive Wing Blade */}
              <rect
                x="20"
                y="10"
                width="120"
                height="10"
                rx="3"
                fill={color}
                stroke="#000"
                strokeWidth="3.5"
              />
              {/* Endplates */}
              <rect x="18" y="6" width="6" height="18" rx="2" fill="#000" />
              <rect x="136" y="6" width="6" height="18" rx="2" fill="#000" />
              {/* Center Twin Exhaust Pipes */}
              <circle cx="76" cy="98" r="4.5" fill="#3f3f46" stroke="#000" strokeWidth="2.5" />
              <circle cx="84" cy="98" r="4.5" fill="#3f3f46" stroke="#000" strokeWidth="2.5" />
            </g>
          )}

          {carId === 'daytona_sp3' && (
            /* Ferrari Daytona SP3: Horizontal Rear Strakes */
            <g>
              <line x1="38" y1="72" x2="122" y2="72" stroke="#000" strokeWidth="3" />
              <line x1="42" y1="78" x2="118" y2="78" stroke="#000" strokeWidth="3" />
              <line x1="46" y1="84" x2="114" y2="84" stroke="#000" strokeWidth="3" />
              {/* High Center Exhausts */}
              <circle cx="74" cy="80" r="4" fill="#000" stroke="#facc15" strokeWidth="1.5" />
              <circle cx="86" cy="80" r="4" fill="#000" stroke="#facc15" strokeWidth="1.5" />
            </g>
          )}

          {carId === 'gtr_nismo' && (
            /* Nissan GT-R Nismo: Iconic Round Quad Taillights */
            <g>
              {/* Left Quad Lights */}
              <circle cx="48" cy="74" r="7" fill="#dc2626" stroke="#000" strokeWidth="3" />
              <circle cx="48" cy="74" r="3.5" fill="#fca5a5" />
              <circle cx="62" cy="74" r="5.5" fill="#dc2626" stroke="#000" strokeWidth="3" />
              <circle cx="62" cy="74" r="2.5" fill="#fca5a5" />

              {/* Right Quad Lights */}
              <circle cx="98" cy="74" r="5.5" fill="#dc2626" stroke="#000" strokeWidth="3" />
              <circle cx="98" cy="74" r="2.5" fill="#fca5a5" />
              <circle cx="112" cy="74" r="7" fill="#dc2626" stroke="#000" strokeWidth="3" />
              <circle cx="112" cy="74" r="3.5" fill="#fca5a5" />

              {/* Dual Big Bore Cannon Exhausts */}
              <circle cx="48" cy="98" r="6" fill="#18181b" stroke="#000" strokeWidth="2.5" />
              <circle cx="112" cy="98" r="6" fill="#18181b" stroke="#000" strokeWidth="2.5" />
            </g>
          )}

          {carId === 'huracan_sto' && (
            /* Lamborghini Huracán STO: Roof Air Scoop & Shark Fin */
            <g>
              {/* Roof Scoop */}
              <path d="M 74,18 L 86,18 L 84,32 L 76,32 Z" fill="#000" stroke="#000" strokeWidth="2" />
              <ellipse cx="80" cy="20" rx="4" ry="2" fill="#06b6d4" />
              {/* Shark Fin */}
              <line x1="80" y1="28" x2="80" y2="48" stroke="#000" strokeWidth="4" />
              {/* Hexagonal Taillight Bars */}
              <path
                d="M 38,72 L 56,76 L 40,78"
                stroke="#ef4444"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 122,72 L 104,76 L 120,78"
                stroke="#ef4444"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              {/* High Mounted Exhausts */}
              <circle cx="72" cy="84" r="4.5" fill="#18181b" stroke="#000" strokeWidth="2.5" />
              <circle cx="88" cy="84" r="4.5" fill="#18181b" stroke="#000" strokeWidth="2.5" />
            </g>
          )}

          {carId === 'valkyrie_amr' && (
            /* Aston Martin Valkyrie AMR: Aerodynamic Void Tunnels */
            <g>
              {/* Deep Air Tunnels */}
              <path d="M 44,82 Q 52,66 60,82 Z" fill="#000" />
              <path d="M 100,82 Q 108,66 116,82 Z" fill="#000" />
              {/* Ultra Thin LED Blade Light */}
              <path
                d="M 34,70 Q 80,66 126,70"
                stroke="#ec4899"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Top Exit Exhausts (F1 Style) */}
              <ellipse cx="74" cy="46" rx="3.5" ry="5" fill="#000" stroke="#facc15" strokeWidth="1.5" />
              <ellipse cx="86" cy="46" rx="3.5" ry="5" fill="#000" stroke="#facc15" strokeWidth="1.5" />
            </g>
          )}

          {/* Standard Modern LED Taillight Strip (if not GTR/Lambo specific) */}
          {carId !== 'gtr_nismo' && carId !== 'huracan_sto' && carId !== 'valkyrie_amr' && (
            <path
              d="M 36,72 Q 80,75 124,72"
              stroke="#ef4444"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* License Plate / Comic Redline Badge */}
          <g>
            <rect
              x="66"
              y="86"
              width="28"
              height="10"
              rx="2"
              fill="#facc15"
              stroke="#000"
              strokeWidth="2"
            />
            <text
              x="80"
              y="93"
              fill="#000"
              fontSize="6"
              fontFamily="monospace"
              fontWeight="900"
              textAnchor="middle"
            >
              REDLINE
            </text>
          </g>
        </svg>
      </div>
    );
  }

  // Top-down view for garage & selector
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 140 220"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`car-top-${carId}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="30%" stopColor={color} />
            <stop offset="70%" stopColor={color} />
            <stop offset="100%" stopColor={accentColor} />
          </linearGradient>
        </defs>

        {/* Ink Ground Drop Shadow */}
        <ellipse cx="70" cy="115" rx="52" ry="95" fill="#000000" opacity="0.6" />

        {/* Front Wheels (Turn with steerDeg) */}
        <g transform={`rotate(${steerDeg} 24 60)`}>
          <rect x="14" y="44" width="18" height="32" rx="5" fill="#18181b" stroke="#000" strokeWidth="3" />
        </g>
        <g transform={`rotate(${steerDeg} 116 60)`}>
          <rect x="108" y="44" width="18" height="32" rx="5" fill="#18181b" stroke="#000" strokeWidth="3" />
        </g>

        {/* Rear Wheels */}
        <rect x="12" y="148" width="20" height="38" rx="6" fill="#18181b" stroke="#000" strokeWidth="3" />
        <rect x="108" y="148" width="20" height="38" rx="6" fill="#18181b" stroke="#000" strokeWidth="3" />

        {/* Main Body Aero Silhouette */}
        <path
          d="M 44,22 C 55,16 85,16 96,22 C 108,30 114,65 110,110 C 114,140 116,170 108,198 C 98,206 42,206 32,198 C 24,170 26,140 30,110 C 26,65 32,30 44,22 Z"
          fill={`url(#car-top-${carId})`}
          stroke="#000"
          strokeWidth="4"
        />

        {/* Cockpit Canopy */}
        <path
          d="M 46,75 C 50,55 90,55 94,75 C 96,105 96,130 92,142 C 86,146 54,146 48,142 C 44,130 44,105 46,75 Z"
          fill="#09090b"
          stroke="#000"
          strokeWidth="3.5"
        />
        {/* Windshield cyan glare */}
        <path
          d="M 48,76 Q 70,70 92,76 L 88,96 Q 70,92 52,96 Z"
          fill="#06b6d4"
          opacity="0.8"
        />

        {/* Hood lines and vents */}
        <path d="M 54,34 L 56,58" stroke="#000" strokeWidth="2.5" />
        <path d="M 86,34 L 84,58" stroke="#000" strokeWidth="2.5" />

        {/* Front Headlights */}
        <ellipse cx="44" cy="30" rx="5" ry="9" fill="#fef08a" stroke="#000" strokeWidth="2" />
        <ellipse cx="96" cy="30" rx="5" ry="9" fill="#fef08a" stroke="#000" strokeWidth="2" />

        {/* Rear Wing in Top View */}
        <rect x="22" y="196" width="96" height="12" rx="3" fill="#000" stroke="#000" strokeWidth="2" />
        <rect x="20" y="194" width="8" height="16" rx="2" fill={color} />
        <rect x="112" y="194" width="8" height="16" rx="2" fill={color} />
      </svg>
    </div>
  );
};
