import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const svgs = {
  'demo-garbage.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <defs>
    <linearGradient id="sky1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#cbd5e1" />
      <stop offset="100%" stop-color="#94a3b8" />
    </linearGradient>
    <linearGradient id="road1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#475569" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
  </defs>
  <rect width="600" height="250" fill="url(#sky1)" />
  <rect y="250" width="600" height="150" fill="url(#road1)" />
  <!-- Buildings skyline -->
  <rect x="40" y="80" width="80" height="170" fill="#64748b" opacity="0.6"/>
  <rect x="140" y="110" width="110" height="140" fill="#64748b" opacity="0.5"/>
  <rect x="420" y="70" width="120" height="180" fill="#64748b" opacity="0.7"/>
  <!-- Garbage Dump Bin Overflowing -->
  <rect x="200" y="180" width="200" height="120" rx="8" fill="#15803d" />
  <rect x="190" y="170" width="220" height="18" rx="4" fill="#166534" />
  <!-- Overflow Bags & Trash -->
  <ellipse cx="250" cy="160" rx="45" ry="30" fill="#334155" />
  <ellipse cx="330" cy="155" rx="50" ry="32" fill="#0284c7" />
  <ellipse cx="290" cy="140" rx="40" ry="25" fill="#f59e0b" />
  <!-- Spilled trash on pavement -->
  <ellipse cx="160" cy="300" rx="40" ry="20" fill="#e2e8f0" opacity="0.8" />
  <ellipse cx="220" cy="320" rx="35" ry="18" fill="#475569" />
  <ellipse cx="380" cy="315" rx="45" ry="22" fill="#0284c7" opacity="0.9" />
  <ellipse cx="440" cy="305" rx="35" ry="16" fill="#f59e0b" />
  <!-- Official Municipal Evidence Banner -->
  <rect x="20" y="20" width="230" height="34" rx="6" fill="#0f172a" />
  <text x="32" y="42" font-family="sans-serif" font-weight="bold" font-size="12" fill="#38bdf8">MUNICIPAL CASE PHOTO</text>
  <text x="220" y="240" font-family="sans-serif" font-weight="bold" font-size="16" fill="#ffffff">SOLID WASTE DUMP</text>
</svg>`,

  'demo-drainage.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <defs>
    <linearGradient id="water1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
  </defs>
  <rect width="600" height="200" fill="#64748b" />
  <rect y="200" width="600" height="200" fill="url(#water1)" />
  <!-- Pavement Curb -->
  <rect y="170" width="600" height="30" fill="#cbd5e1" />
  <!-- Submerged Drain Grate -->
  <rect x="220" y="240" width="160" height="90" rx="6" fill="#0f172a" />
  <line x1="240" y1="245" x2="240" y2="325" stroke="#475569" stroke-width="6" />
  <line x1="270" y1="245" x2="270" y2="325" stroke="#475569" stroke-width="6" />
  <line x1="300" y1="245" x2="300" y2="325" stroke="#475569" stroke-width="6" />
  <line x1="330" y1="245" x2="330" y2="325" stroke="#475569" stroke-width="6" />
  <line x1="360" y1="245" x2="360" y2="325" stroke="#475569" stroke-width="6" />
  <!-- Water ripples -->
  <ellipse cx="300" cy="285" rx="140" ry="25" fill="none" stroke="#7dd3fc" stroke-width="3" opacity="0.6"/>
  <ellipse cx="300" cy="285" rx="190" ry="35" fill="none" stroke="#7dd3fc" stroke-width="2" opacity="0.4"/>
  <!-- Official Municipal Evidence Banner -->
  <rect x="20" y="20" width="230" height="34" rx="6" fill="#0f172a" />
  <text x="32" y="42" font-family="sans-serif" font-weight="bold" font-size="12" fill="#38bdf8">MUNICIPAL CASE PHOTO</text>
  <text x="30" y="380" font-family="sans-serif" font-weight="bold" font-size="16" fill="#ffffff">URBAN FLOODING / BLOCKED CONDUIT</text>
</svg>`,

  'demo-water-leak.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <rect width="600" height="400" fill="#334155" />
  <rect y="120" width="600" height="280" fill="#1e293b" />
  <!-- Broken Pipeline Joint -->
  <rect x="180" y="260" width="240" height="50" rx="8" fill="#64748b" />
  <rect x="280" y="250" width="40" height="70" rx="4" fill="#475569" stroke="#94a3b8" stroke-width="4" />
  <!-- High Pressure Water Fountain -->
  <path d="M295 250 Q 280 80, 270 40 Q 300 30, 310 40 Q 320 80, 305 250 Z" fill="#38bdf8" opacity="0.85" />
  <ellipse cx="300" cy="280" rx="120" ry="40" fill="#0284c7" opacity="0.5" />
  <!-- Official Municipal Evidence Banner -->
  <rect x="20" y="20" width="230" height="34" rx="6" fill="#0f172a" />
  <text x="32" y="42" font-family="sans-serif" font-weight="bold" font-size="12" fill="#38bdf8">MUNICIPAL CASE PHOTO</text>
  <text x="30" y="375" font-family="sans-serif" font-weight="bold" font-size="16" fill="#38bdf8">BURST MAIN PIPELINE</text>
</svg>`,

  'demo-resolved-pipe.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <rect width="600" height="400" fill="#1e293b" />
  <!-- Repaired clean dry pipeline section -->
  <rect x="160" y="220" width="280" height="50" rx="8" fill="#475569" />
  <rect x="270" y="210" width="60" height="70" rx="6" fill="#059669" stroke="#34d399" stroke-width="4" />
  <!-- Repaired trench leveled -->
  <rect x="120" y="290" width="360" height="30" fill="#78716c" rx="4" />
  <!-- Verification Green Stamp -->
  <rect x="20" y="20" width="240" height="34" rx="6" fill="#059669" />
  <text x="32" y="42" font-family="sans-serif" font-weight="bold" font-size="12" fill="#ffffff">OFFICIAL RESOLUTION PROOF</text>
  <circle cx="500" cy="100" r="45" fill="#059669" opacity="0.9" />
  <path d="M480 100 L 495 115 L 525 85" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" />
  <text x="465" y="165" font-family="sans-serif" font-weight="bold" font-size="14" fill="#34d399">REPAIRED</text>
</svg>`,

  'demo-pothole.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <rect width="600" height="400" fill="#334155" />
  <!-- Road yellow lane divider -->
  <line x1="300" y1="0" x2="300" y2="400" stroke="#facc15" stroke-width="8" stroke-dasharray="30 20" />
  <!-- Huge jagged pothole -->
  <polygon points="200,240 280,210 370,230 420,290 350,340 240,330 180,280" fill="#0f172a" stroke="#64748b" stroke-width="6" />
  <!-- Loose gravel and rubble -->
  <ellipse cx="260" cy="270" rx="20" ry="12" fill="#78716c" />
  <ellipse cx="320" cy="290" rx="25" ry="15" fill="#57534e" />
  <!-- Official Municipal Evidence Banner -->
  <rect x="20" y="20" width="230" height="34" rx="6" fill="#0f172a" />
  <text x="32" y="42" font-family="sans-serif" font-weight="bold" font-size="12" fill="#38bdf8">MUNICIPAL CASE PHOTO</text>
  <text x="30" y="380" font-family="sans-serif" font-weight="bold" font-size="16" fill="#ffffff">ASPHALT ROAD DAMAGE</text>
</svg>`,

  'demo-streetlight.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <!-- Night sky -->
  <rect width="600" height="400" fill="#090d16" />
  <!-- Streetlight pole -->
  <rect x="290" y="80" width="20" height="320" fill="#475569" />
  <!-- Lamp arm -->
  <path d="M300 90 Q 300 40, 240 40 L 210 40" fill="none" stroke="#475569" stroke-width="12" stroke-linecap="round" />
  <!-- Broken luminaire / dark bulb -->
  <rect x="180" y="35" width="40" height="20" rx="4" fill="#334155" />
  <!-- Red alert cross on lamp -->
  <line x1="170" y1="70" x2="230" y2="70" stroke="#ef4444" stroke-width="4" stroke-dasharray="6 4" />
  <!-- Official Municipal Evidence Banner -->
  <rect x="20" y="20" width="230" height="34" rx="6" fill="#0f172a" />
  <text x="32" y="42" font-family="sans-serif" font-weight="bold" font-size="12" fill="#38bdf8">MUNICIPAL CASE PHOTO</text>
  <text x="30" y="380" font-family="sans-serif" font-weight="bold" font-size="16" fill="#94a3b8">NON-FUNCTIONAL STREETLIGHT</text>
</svg>`,

  'demo-smoke.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <rect width="600" height="400" fill="#78716c" opacity="0.6" />
  <rect y="260" width="600" height="140" fill="#292524" />
  <!-- Industrial chimney -->
  <rect x="360" y="160" width="60" height="150" fill="#44403c" />
  <!-- Heavy dark toxic plumes -->
  <ellipse cx="370" cy="110" rx="60" ry="40" fill="#1c1917" opacity="0.85" />
  <ellipse cx="320" cy="70" rx="80" ry="50" fill="#292524" opacity="0.75" />
  <ellipse cx="260" cy="40" rx="90" ry="55" fill="#44403c" opacity="0.65" />
  <ellipse cx="180" cy="30" rx="100" ry="60" fill="#57534e" opacity="0.55" />
  <!-- Official Municipal Evidence Banner -->
  <rect x="20" y="20" width="230" height="34" rx="6" fill="#0f172a" />
  <text x="32" y="42" font-family="sans-serif" font-weight="bold" font-size="12" fill="#38bdf8">MUNICIPAL CASE PHOTO</text>
  <text x="30" y="380" font-family="sans-serif" font-weight="bold" font-size="16" fill="#f87171">HAZARDOUS INDUSTRIAL SMOKE</text>
</svg>`
};

export const createSampleSvgs = () => {
  for (const [filename, content] of Object.entries(svgs)) {
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, content.trim());
  }
};
