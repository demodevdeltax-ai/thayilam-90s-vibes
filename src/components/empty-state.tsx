import emptyDabba from "@/assets/illustration-empty-dabba.png";
import { Button } from "@/components/ui/button";

export function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="paper ink-border-thin rounded-2xl p-10 md:p-16 text-center">
      <img
        src={emptyDabba}
        alt="An empty dabba"
        loading="lazy"
        width={512}
        height={512}
        className="mx-auto w-48 h-48 md:w-60 md:h-60 line-art"
      />
      <h3 className="font-display text-2xl md:text-3xl text-brown mt-4">
        No snacks found
      </h3>
      <p className="text-brown/70 font-script text-2xl mt-1">
        try another search!
      </p>
      <div className="mt-6">
        <Button onClick={onReset}>Clear filters</Button>
      </div>
    </div>
  );
}
