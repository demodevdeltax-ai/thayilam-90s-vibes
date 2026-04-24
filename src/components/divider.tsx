import { LeafIcon } from "./icons";

/**
 * A horizontal hand-drawn dashed rule with a centered leaf.
 * Use as a section divider.
 */
export function Divider({ icon = true }: { icon?: boolean }) {
  return (
    <div className="flex items-center gap-4 text-brown/70 my-10">
      <div className="dashed-rule flex-1" />
      {icon && <LeafIcon size={26} className="rotate-12" />}
      <div className="dashed-rule flex-1" />
    </div>
  );
}
