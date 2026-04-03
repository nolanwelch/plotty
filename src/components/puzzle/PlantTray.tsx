import { PLANTS } from "@/lib/plants";
import type { PlantType } from "@/models/puzzle.models";
import PlantToken from "./PlantToken";

interface PlantTrayProps {
  selectedPiece: PlantType | null;
  remaining: Record<PlantType, number>;
  onPieceClick: (type: PlantType) => void;
}

export default function PlantTray({ selectedPiece, remaining, onPieceClick }: PlantTrayProps) {
  const plantEntries = Object.keys(PLANTS) as PlantType[];
  const topRow = plantEntries.slice(0, 4);
  const bottomRow = plantEntries.slice(4);

  return (
    <div className="flex flex-col items-center gap-[min(1.5vw,6px)] lg:gap-[min(2.8vw,10px)] lg:mb-3 px-2 pt-8 pb-4">
      <div className="flex gap-[min(1.5vw,6px)] lg:gap-[min(2.8vw,10px)]">
        {topRow.map((type) => (
          <PlantToken
            key={type}
            type={type}
            compact
            selected={selectedPiece === type}
            onClick={() => onPieceClick(type)}
            count={remaining[type]}
            disabled={remaining[type] <= 0}
          />
        ))}
      </div>
      <div className="flex gap-[min(1.5vw,6px)] lg:gap-[min(2.8vw,10px)]">
        {bottomRow.map((type) => (
          <PlantToken
            key={type}
            type={type}
            compact
            selected={selectedPiece === type}
            onClick={() => onPieceClick(type)}
            count={remaining[type]}
            disabled={remaining[type] <= 0}
          />
        ))}
      </div>
    </div>
  );
}
