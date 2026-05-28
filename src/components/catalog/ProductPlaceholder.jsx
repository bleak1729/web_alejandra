const CATEGORY_COLORS = {
  acidos:    { bg: '#e8f0e8', accent: '#5a8a55', icon: '⚗️' },
  ceras:     { bg: '#f9f1e3', accent: '#bf8f3c', icon: '🕯️' },
  extractos: { bg: '#f3eef8', accent: '#8a5a8a', icon: '🌿' },
  aceites:   { bg: '#fff8e8', accent: '#d4a857', icon: '💧' },
};

const DEFAULT = { bg: '#fbeeea', accent: '#c98473', icon: '✨' };

export default function ProductPlaceholder({ nombre = '', categoria = '' }) {
  const { bg, accent, icon } = CATEGORY_COLORS[categoria?.toLowerCase()] ?? DEFAULT;
  const initials = nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width="100%"
      height="100%"
      aria-label={nombre}
    >
      <rect width="200" height="200" fill={bg} />
      <circle cx="100" cy="85" r="48" fill={accent} fillOpacity="0.15" />
      <circle cx="100" cy="85" r="34" fill={accent} fillOpacity="0.2" />
      <text x="100" y="96" textAnchor="middle" fontSize="28" fontFamily="Georgia, serif" fill={accent} fontWeight="bold">
        {initials || icon}
      </text>
      <text x="100" y="148" textAnchor="middle" fontSize="10" fontFamily="Georgia, serif" fill={accent} opacity="0.7">
        {icon}
      </text>
      <text x="100" y="172" textAnchor="middle" fontSize="8" fontFamily="sans-serif" fill={accent} opacity="0.5" letterSpacing="2">
        VIDACOSMETIC
      </text>
    </svg>
  );
}
