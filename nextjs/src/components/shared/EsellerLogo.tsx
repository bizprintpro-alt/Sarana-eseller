export default function EsellerLogo({ size = 28 }: { size?: number }) {
  const h = (size / 28) * 26;
  return (
    <svg width={size} height={h} viewBox="0 0 28 26" fill="none">
      <polygon points="14,0 28,8 22,26 6,26 0,8" fill="#CC0000" opacity=".12" />
      <polygon
        points="14,2 26,9 21,24 7,24 2,9"
        fill="none"
        stroke="#CC0000"
        strokeWidth="1.3"
      />
      <polygon
        points="14,2 26,9 14,24 2,9"
        fill="none"
        stroke="#CC0000"
        strokeWidth=".8"
        opacity=".5"
      />
      <line x1="2" y1="9" x2="26" y2="9" stroke="#CC0000" strokeWidth=".8" opacity=".4" />
    </svg>
  );
}
