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

export function AntennaIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      {/* TV body */}
      <rect x="8" y="22" width="32" height="20" rx="2" />
      <rect x="12" y="26" width="20" height="12" />
      <circle cx="36" cy="30" r="1.2" />
      <circle cx="36" cy="34" r="1.2" />
      {/* Antenna */}
      <path d="M24 22V14" />
      <path d="M24 14l-8-8" />
      <path d="M24 14l8-8" />
      {/* Feet */}
      <path d="M14 42v3M34 42v3" />
    </svg>
  );
}

export function BottleIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      {/* Bisleri-style water bottle */}
      <path d="M20 6h8v4l2 2v4l-1 2v22a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4V18l-1-2v-4l2-2z" />
      <path d="M19 20h10" />
      <path d="M19 24h10" />
      <path d="M21 30h6v8h-6z" />
    </svg>
  );
}

export function WatchIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      {/* HMT wristwatch */}
      <rect x="14" y="16" width="20" height="16" rx="3" />
      <circle cx="24" cy="24" r="6" />
      <path d="M24 21v3l2 1.5" />
      <path d="M18 16l2-8h8l2 8" />
      <path d="M18 32l2 8h8l2-8" />
    </svg>
  );
}

export function DabbaIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      {/* Stacked steel tiffin */}
      <ellipse cx="24" cy="10" rx="12" ry="3" />
      <path d="M12 10v4c0 1.5 5.4 3 12 3s12-1.5 12-3v-4" />
      <path d="M13 16v6c0 1.5 5 3 11 3s11-1.5 11-3v-6" />
      <path d="M14 24v6c0 1.5 4.5 3 10 3s10-1.5 10-3v-6" />
      <path d="M15 32v4c0 1.5 4 3 9 3s9-1.5 9-3v-4" />
      {/* Handle */}
      <path d="M18 10c0-4 4-6 6-6s6 2 6 6" />
    </svg>
  );
}

export function ColaIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      {/* Campa Cola bottle */}
      <path d="M21 4h6v4l1 3v4l-1 2v22a3 3 0 0 1-3 3h-1a3 3 0 0 1-3-3V17l-1-2v-4l1-3z" />
      <path d="M20 11h8" />
      <path d="M21 18c1.5 1 4.5 1 6 0" />
      <path d="M21 22c1.5 1 4.5 1 6 0" />
      <path d="M21 26c1.5 1 4.5 1 6 0" />
    </svg>
  );
}

export function BiscuitIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      {/* Parle-G style biscuit */}
      <rect x="8" y="14" width="32" height="20" rx="3" />
      <circle cx="13" cy="19" r="0.8" />
      <circle cx="19" cy="19" r="0.8" />
      <circle cx="25" cy="19" r="0.8" />
      <circle cx="31" cy="19" r="0.8" />
      <circle cx="13" cy="29" r="0.8" />
      <circle cx="19" cy="29" r="0.8" />
      <circle cx="25" cy="29" r="0.8" />
      <circle cx="31" cy="29" r="0.8" />
      <path d="M16 24h16" />
      <path d="M20 22l-1 4M24 22l-1 4M28 22l-1 4" />
    </svg>
  );
}

export function HeartIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M24 40s-14-8-14-20a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 12-14 20-14 20z" />
    </svg>
  );
}

export function ShieldIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M24 6l14 4v12c0 10-7 17-14 20-7-3-14-10-14-20V10z" />
      <path d="M18 24l4 4 8-10" />
    </svg>
  );
}

export function HandsIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M8 30c0-4 2-8 6-10v-8a2 2 0 0 1 4 0v8" />
      <path d="M18 22v-12a2 2 0 0 1 4 0v12" />
      <path d="M22 22v-10a2 2 0 0 1 4 0v14" />
      <path d="M26 26v-8a2 2 0 0 1 4 0v8c0 8-4 14-10 14s-10-4-12-10" />
    </svg>
  );
}

export function ChefIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M14 24c-4 0-6-3-6-6s3-6 6-5c0-4 4-7 8-7s8 3 8 7c3-1 6 2 6 5s-2 6-6 6" />
      <path d="M14 24h20v10a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4z" />
      <path d="M14 28h20" />
    </svg>
  );
}

export function ListIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <rect x="10" y="6" width="28" height="36" rx="2" />
      <path d="M16 14h16M16 20h16M16 26h12M16 32h10" />
      <circle cx="14" cy="14" r="0.8" />
      <circle cx="14" cy="20" r="0.8" />
      <circle cx="14" cy="26" r="0.8" />
      <circle cx="14" cy="32" r="0.8" />
    </svg>
  );
}

export function CartIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M6 8h6l4 22h22l4-16H14" />
      <circle cx="20" cy="38" r="3" />
      <circle cx="36" cy="38" r="3" />
    </svg>
  );
}

export function ScooterIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="12" cy="36" r="5" />
      <circle cx="36" cy="36" r="5" />
      <path d="M12 36l4-16h10l4 12" />
      <path d="M26 20l6-6h6" />
      <path d="M16 20h8" />
      <rect x="28" y="22" width="10" height="8" rx="1" />
    </svg>
  );
}
