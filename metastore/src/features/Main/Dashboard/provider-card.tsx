import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProviderCardProps {
  id: string;
  name: string;
  logo: string;
  selected: boolean;
  onClick: () => void;
}

export function ProviderCard({
  name,
  logo,
  selected,
  onClick,
}: ProviderCardProps) {
  return (
    <div
      className={cn(
        "relative flex items-center space-x-3 rounded-lg border border-border/50 p-3 shadow-sm transition-all hover:border-primary/50 hover:shadow",
        selected && "border-primary bg-primary/5"
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        <img
          src={logo || "/placeholder.svg"}
          alt={name}
          className="h-10 w-10"
        />
      </div>
      <div className="min-w-0 flex-1">
        <button className="focus:outline-none w-full text-left">
          <span className="absolute inset-0" aria-hidden="true" />
          <p className="text-sm font-medium">{name}</p>
        </button>
      </div>
      {selected && (
        <div className="flex-shrink-0 text-primary">
          <Check className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
