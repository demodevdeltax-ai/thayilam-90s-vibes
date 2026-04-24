// Single-stroke SVG icons inspired by Bapu line art.
// All paths use currentColor and a thin stroke.

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 24) => ({
  width: size,
  height: size,
  viewBox: "0 0 48 48",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function LeafIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M8 40c0-16 12-28 32-32-2 20-14 32-32 32z" />
      <path d="M8 40c8-8 16-14 28-22" />
    </svg>
  );
}

export function LadooIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="24" cy="28" r="14" />
      <path d="M24 14c-1-3 1-6 4-6" />
      <path d="M20 18c2-1 6-1 8 0" />
    </svg>
  );
}

export function MurukkuIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="24" cy="24" r="16" />
      <circle cx="24" cy="24" r="11" />
      <circle cx="24" cy="24" r="6" />
      <path d="M24 8v32M8 24h32M12 12l24 24M36 12L12 36" />
    </svg>
  );
}

export function ChakliIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M24 24m-15 0a15 15 0 1 0 30 0 15 15 0 1 0-30 0" />
      <path d="M24 24c0-6 5-9 9-6s2 11-4 12-12-3-12-10 7-13 14-13" />
    </svg>
  );
}

export function RibbonIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M8 24c4-6 12-6 16 0s12 6 16 0" />
      <path d="M8 30c4-6 12-6 16 0s12 6 16 0" />
    </svg>
  );
}

export function SparkIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M24 6v12M24 30v12M6 24h12M30 24h12M12 12l8 8M28 28l8 8M36 12l-8 8M20 28l-8 8" />
    </svg>
  );
}

export function FlowerIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="24" cy="24" r="4" />
      <path d="M24 20c-2-4-2-10 0-14 2 4 2 10 0 14z" />
      <path d="M24 28c-2 4-2 10 0 14 2-4 2-10 0-14z" />
      <path d="M20 24c-4-2-10-2-14 0 4 2 10 2 14 0z" />
      <path d="M28 24c4-2 10-2 14 0-4 2-10 2-14 0z" />
    </svg>
  );
}

export function MangoIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M14 28c0-10 6-16 14-14s8 14 0 20-14 4-14-6z" />
      <path d="M28 14c0-3 2-6 6-6" />
    </svg>
  );
}
