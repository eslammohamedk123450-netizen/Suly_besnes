import React from 'react';

interface Shiny3DIconProps {
  size?: number;
  className?: string;
}

/**
 * 3D Shiny Metallic Cash / Currency Ingot Medallion
 * Embossed metallic coin with bevel edges, deep specular reflection, and luxury emerald-gold luster.
 */
export const Shiny3DCashIcon: React.FC<Shiny3DIconProps> = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-[0_2px_8px_rgba(16,185,129,0.35)] ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* 3D Cylindrical Coin Rim Gradient */}
        <linearGradient id="cashRim3D" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="30%" stopColor="#15803d" />
          <stop offset="50%" stopColor="#052e16" />
          <stop offset="80%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>

        {/* Outer Gold/Emerald Metallic Ring */}
        <radialGradient id="cashFace3D" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="25%" stopColor="#22c55e" />
          <stop offset="65%" stopColor="#15803d" />
          <stop offset="90%" stopColor="#0f5127" />
          <stop offset="100%" stopColor="#052e16" />
        </radialGradient>

        {/* Inner Gold Bevel Ring */}
        <linearGradient id="cashGoldBevel" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#eab308" />
          <stop offset="70%" stopColor="#854d0e" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>

        {/* Specular Highlight Sheen */}
        <linearGradient id="cashSpecular" x1="0%" y1="0%" x2="60%" y2="80%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Cast 3D Drop Shadow */}
      <ellipse cx="32" cy="56" rx="24" ry="5" fill="#000000" fillOpacity="0.45" />

      {/* Outer Coin Body Depth (3D bevel rim) */}
      <circle cx="32" cy="33" r="26" fill="url(#cashRim3D)" />
      <circle cx="32" cy="31" r="26" fill="#064e3b" />

      {/* Main Face */}
      <circle cx="32" cy="30" r="24" fill="url(#cashFace3D)" stroke="url(#cashGoldBevel)" strokeWidth="2" />

      {/* Inner Decorative Bevel Groove */}
      <circle cx="32" cy="30" r="19" fill="none" stroke="url(#cashGoldBevel)" strokeWidth="1" strokeDasharray="3 1.5" strokeOpacity="0.8" />

      {/* Central Cash Currency Symbol / Note Stack Emblem */}
      <g transform="translate(18, 16)">
        {/* Banknote / Ingot Shape */}
        <rect x="2" y="5" width="24" height="15" rx="3" fill="#064e3b" stroke="url(#cashGoldBevel)" strokeWidth="1.5" />
        <rect x="4" y="7" width="20" height="11" rx="1.5" fill="#0f5127" stroke="rgba(254,240,138,0.4)" strokeWidth="0.8" />
        <circle cx="14" cy="12.5" r="3.5" fill="url(#cashGoldBevel)" />
        <circle cx="14" cy="12.5" r="2" fill="#064e3b" />
        {/* Corner currency notches */}
        <circle cx="6" cy="9" r="1" fill="#fef08a" />
        <circle cx="22" cy="9" r="1" fill="#fef08a" />
        <circle cx="6" cy="16" r="1" fill="#fef08a" />
        <circle cx="22" cy="16" r="1" fill="#fef08a" />
      </g>

      {/* 3D Specular Highlight Crest (Glass/Metal Sheen) */}
      <path
        d="M 14 24 C 18 14, 38 12, 50 20 C 44 26, 26 29, 14 24 Z"
        fill="url(#cashSpecular)"
      />

      {/* Star Glint / Sparkle */}
      <path
        d="M 44 14 Q 45 17 48 18 Q 45 19 44 22 Q 43 19 40 18 Q 43 17 44 14 Z"
        fill="#ffffff"
        opacity="0.9"
      />
    </svg>
  );
};

/**
 * 3D Shiny Metallic Diamond / Faceted Gemstone
 * Brilliant multifaceted gemstone with cyan/blue depth, polished edges, and sparkling light refraction.
 */
export const Shiny3DDiamondIcon: React.FC<Shiny3DIconProps> = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-[0_2px_10px_rgba(6,182,212,0.45)] ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Crown table gradient */}
        <linearGradient id="gemTable" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#a5f3fc" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        {/* Top kite facet left */}
        <linearGradient id="gemKiteL" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Top kite facet right */}
        <linearGradient id="gemKiteR" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        {/* Pavillion lower cone left */}
        <linearGradient id="gemPavL" x1="0%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>

        {/* Pavillion lower center */}
        <linearGradient id="gemPavC" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#082f49" />
        </linearGradient>

        {/* Pavillion lower right */}
        <linearGradient id="gemPavR" x1="100%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>

        {/* Girdle specular glow */}
        <linearGradient id="gemSheen" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#a5f3fc" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="32" cy="56" rx="20" ry="4.5" fill="#000000" fillOpacity="0.4" />

      {/* Lower Pavilion Facets (Bottom Cone) */}
      {/* Outer Left */}
      <polygon points="10,25 21,25 32,54" fill="url(#gemPavL)" stroke="#0e7490" strokeWidth="0.5" />
      {/* Center Left */}
      <polygon points="21,25 32,25 32,54" fill="url(#gemPavC)" stroke="#38bdf8" strokeWidth="0.5" />
      {/* Center Right */}
      <polygon points="32,25 43,25 32,54" fill="url(#gemPavC)" stroke="#38bdf8" strokeWidth="0.5" />
      {/* Outer Right */}
      <polygon points="43,25 54,25 32,54" fill="url(#gemPavR)" stroke="#0e7490" strokeWidth="0.5" />

      {/* Upper Crown Facets */}
      {/* Far Left Upper */}
      <polygon points="10,25 20,13 21,25" fill="url(#gemKiteL)" stroke="#bae6fd" strokeWidth="0.5" />
      {/* Center Left Upper */}
      <polygon points="20,13 32,13 21,25" fill="url(#gemTable)" stroke="#ffffff" strokeWidth="0.5" />
      {/* Center Flat Table */}
      <polygon points="21,25 32,13 43,25" fill="#ecfeff" stroke="#ffffff" strokeWidth="0.5" />
      {/* Center Right Upper */}
      <polygon points="32,13 44,13 43,25" fill="url(#gemKiteR)" stroke="#bae6fd" strokeWidth="0.5" />
      {/* Far Right Upper */}
      <polygon points="44,13 54,25 43,25" fill="url(#gemPavR)" stroke="#38bdf8" strokeWidth="0.5" />

      {/* Top Table Facet (Flat diamond top) */}
      <polygon points="20,13 32,9 44,13 32,16" fill="url(#gemTable)" stroke="#ffffff" strokeWidth="0.6" />

      {/* Girdle Crisp Light Edge */}
      <line x1="10" y1="25" x2="54" y2="25" stroke="url(#gemSheen)" strokeWidth="1.2" />

      {/* Diamond Sparkle Highlight */}
      <path
        d="M 22 10 Q 23 13 26 14 Q 23 15 22 18 Q 21 15 18 14 Q 21 13 22 10 Z"
        fill="#ffffff"
      />
      <circle cx="44" cy="24" r="1.5" fill="#ffffff" />
    </svg>
  );
};

/**
 * 3D Shiny Metallic Gold Bullion / Medallion
 * Heavy solid 24k gold coin with double metallic rim, concentric engine turning, and high-specular gold sheen.
 */
export const Shiny3DGoldIcon: React.FC<Shiny3DIconProps> = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-[0_2px_10px_rgba(245,158,11,0.45)] ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* 3D Gold Cylindrical Depth Rim */}
        <linearGradient id="goldRimDepth" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="25%" stopColor="#eab308" />
          <stop offset="50%" stopColor="#713f12" />
          <stop offset="75%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>

        {/* Polished Gold Face Gradient */}
        <radialGradient id="goldFaceRadial" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="25%" stopColor="#fde047" />
          <stop offset="55%" stopColor="#eab308" />
          <stop offset="85%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#854d0e" />
        </radialGradient>

        {/* Metallic Bevel Ring */}
        <linearGradient id="goldBevelRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#facc15" />
          <stop offset="70%" stopColor="#713f12" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>

        {/* Specular curved reflection */}
        <linearGradient id="goldSpecular" x1="15%" y1="10%" x2="70%" y2="85%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Cast Shadow */}
      <ellipse cx="32" cy="56" rx="24" ry="5" fill="#000000" fillOpacity="0.5" />

      {/* 3D Depth Layer */}
      <circle cx="32" cy="33" r="26" fill="url(#goldRimDepth)" />
      <circle cx="32" cy="31" r="26" fill="#713f12" />

      {/* Coin Front Face */}
      <circle cx="32" cy="30" r="25" fill="url(#goldFaceRadial)" stroke="url(#goldBevelRing)" strokeWidth="2.2" />

      {/* Stepped Inner Bevel (Double Rim) */}
      <circle cx="32" cy="30" r="20" fill="none" stroke="url(#goldBevelRing)" strokeWidth="1.2" strokeOpacity="0.9" />

      {/* Fine engine-turning beaded circle */}
      <circle cx="32" cy="30" r="17.5" fill="none" stroke="#ca8a04" strokeWidth="0.8" strokeDasharray="2.5 1.5" />

      {/* Center 999.9 Gold Bullion / Scales Symbol */}
      <g transform="translate(19, 17)">
        {/* Ingot bar in center */}
        <path
          d="M 6 10 L 20 10 L 23 18 L 3 18 Z"
          fill="url(#goldBevelRing)"
          stroke="#713f12"
          strokeWidth="1"
        />
        {/* Karat stamp 999.9 */}
        <text
          x="13"
          y="16.5"
          textAnchor="middle"
          fill="#451a03"
          fontSize="5.5"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          letterSpacing="0.4"
        >
          999.9
        </text>
        {/* Top mini crown */}
        <path
          d="M 8 7 L 13 4 L 18 7 L 16 8 L 10 8 Z"
          fill="#fef08a"
          stroke="#854d0e"
          strokeWidth="0.6"
        />
      </g>

      {/* Specular Light Crescent */}
      <path
        d="M 15 22 C 20 13, 38 12, 49 19 C 43 25, 27 27, 15 22 Z"
        fill="url(#goldSpecular)"
      />

      {/* Shiny Star Highlight */}
      <path
        d="M 45 14 Q 46 17 49 18 Q 46 19 45 22 Q 44 19 41 18 Q 44 17 45 14 Z"
        fill="#ffffff"
      />
    </svg>
  );
};
