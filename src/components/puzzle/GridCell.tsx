import { Lock } from "lucide-react";
import { PLANTS } from "@/lib/plants";
import type { HighlightType, PlantType } from "@/models/puzzle.models";

interface GridCellProps {
  plant: PlantType | null;
  isHint: boolean;
  isSelected: boolean;
  isFocused: boolean;
  hasViolation: boolean;
  allHappy: boolean;
  highlight: HighlightType | null;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

function bgClass(props: GridCellProps): string {
  const { plant, isHint, isSelected, hasViolation, allHappy, highlight } = props;
  if (highlight === "companion") return "bg-sage/30";
  if (highlight === "antagonist") return "bg-error/25";
  if (highlight === "shade") return "bg-sun/30";
  if (highlight === "trait") return "bg-terracotta/15";
  if (highlight === "empty-hint") return "bg-sage/20";
  if (isHint) return "bg-gradient-to-br from-sage-light/55 to-sage-light/35";
  if (plant && hasViolation) return "bg-error/15";
  if (plant && allHappy) return "bg-sage/15";
  if (plant) return "bg-parchment";
  if (isSelected) return "bg-cream-dark";
  return "bg-parchment";
}

function borderClass(props: GridCellProps): string {
  const { plant, isHint, isFocused, isSelected, hasViolation, allHappy, highlight } = props;
  if (highlight === "companion") return "border-[3px] border-sage";
  if (highlight === "antagonist") return "border-[3px] border-error";
  if (highlight === "shade") return "border-[3px] border-sun";
  if (highlight === "trait") return "border-[3px] border-terracotta/40";
  if (isFocused && allHappy && plant) return "border-[3px] border-sage";
  if (isFocused && hasViolation && plant) return "border-[3px] border-error";
  if (isFocused && isHint) return "border-[3px] border-sage-dark";
  if (isFocused && plant) return "border-[3px] border-terracotta";
  if (isFocused) return "border-[3px] border-loam/40";
  if (isSelected) return "border-[2.5px] border-terracotta";
  if (hasViolation && plant) return "border-2 border-error";
  if (allHappy && plant) return "border-2 border-sage";
  return "border-[1.5px] border-cream-dark";
}

function shadowClass(props: GridCellProps): string {
  const { isFocused, highlight, hasViolation, allHappy, plant } = props;
  if (isFocused && allHappy && plant) return "shadow-[0_0_0_4px_theme(--color-sage/0.2)]";
  if (isFocused && hasViolation && plant) return "shadow-[0_0_0_4px_theme(--color-error/0.2)]";
  if (isFocused) return "shadow-[0_0_0_4px_theme(--color-terracotta/0.13)]";
  if (highlight === "antagonist") return "shadow-[0_0_10px_theme(--color-error/0.25)]";
  if (highlight === "companion") return "shadow-[0_0_10px_theme(--color-sage/0.25)]";
  if (highlight === "shade") return "shadow-[0_0_10px_theme(--color-sun/0.25)]";
  if (highlight) return "shadow-[0_0_10px_theme(--color-sage/0.12)]";
  if (hasViolation && plant) return "shadow-[0_0_8px_theme(--color-error/0.2)]";
  if (allHappy && plant) return "shadow-[0_0_8px_theme(--color-sage/0.2)]";
  return "shadow-[inset_0_2px_4px_#00000008]";
}

export default function GridCell(props: GridCellProps) {
  const { plant, isHint, isFocused, allHappy, onClick, onContextMenu } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`
        relative w-full aspect-square min-w-0 flex flex-col items-center justify-center
        rounded-[18%] cursor-pointer transition-all duration-150 p-0
        text-[min(11vw,48px)]
        ${bgClass(props)} ${borderClass(props)} ${shadowClass(props)}
        ${isFocused ? "scale-[1.04]" : "scale-100"}
      `}
    >
      {plant && (
        <span
          className={`transition-[filter] duration-200 ${
            allHappy && !isFocused ? "drop-shadow-[0_1px_3px_#4CAF5044]" : ""
          }`}
        >
          {PLANTS[plant].emoji}
        </span>
      )}

      {isHint && (
        <div className="absolute bottom-[4%] right-[6%] text-sage-dark/70">
          <Lock size={16} />
        </div>
      )}
    </button>
  );
}
