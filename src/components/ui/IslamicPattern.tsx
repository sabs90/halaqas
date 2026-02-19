export function IslamicPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="islamicGeo" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="20" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.07" />
          <circle cx="0" cy="0" r="20" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.07" />
          <circle cx="60" cy="0" r="20" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.07" />
          <circle cx="0" cy="60" r="20" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.07" />
          <circle cx="60" cy="60" r="20" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.07" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamicGeo)" />
    </svg>
  );
}
