import { PLANTS } from "@/lib/plants";
import type { PlantType } from "@/models/puzzle.models";

interface PlantTokenProps {
  type: PlantType;
  onClick: () => void;
  selected: boolean;
  count: number;
  disabled: boolean;
  compact?: boolean;
}

export default function PlantToken({
  type,
  onClick,
  selected,
  count,
  disabled,
  compact,
}: PlantTokenProps) {
  const sizeClass = compact
    ? "w-[min(16vw,68px)] h-[min(16vw,68px)] text-[min(10vw,40px)] rounded-[min(4vw,16px)]"
    : "w-[min(15vw,64px)] h-[min(15vw,64px)] text-[min(9vw,36px)] rounded-[min(3.5vw,16px)]";

  const badgeClass = compact
    ? "absolute -top-[5px] -right-[5px] bg-terracotta text-white text-[11px] font-bold font-body w-5 h-5 rounded-full flex items-center justify-center shadow-[0_1px_3px_#00000030]"
    : "absolute -top-[7px] -right-[7px] bg-terracotta text-white text-[13px] font-bold font-body w-6 h-6 rounded-full flex items-center justify-center shadow-[0_1px_3px_#00000030]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex items-center justify-center p-0 min-w-0
        ${sizeClass} transition-all duration-[120ms]
        ${selected ? "border-[3px] border-terracotta bg-cream-dark scale-[1.08] shadow-[0_2px_12px_theme(--color-terracotta/0.27)]" : "border-2 border-transparent shadow-[0_1px_3px_#00000015]"}
        ${disabled ? "bg-[#eee8dd] opacity-30 cursor-default" : selected ? "bg-cream-dark cursor-pointer" : "bg-cream cursor-pointer"}
      `}
    >
      {PLANTS[type].emoji}
      {count > 0 && <span className={badgeClass}>{count}</span>}
    </button>
  );
}
