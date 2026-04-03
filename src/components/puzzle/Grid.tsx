import { ArrowDown, Sun } from "lucide-react";
import { t } from "@/lib/i18n";
import { getConstraints } from "@/lib/puzzle-logic";
import type { GameBoard, HighlightType } from "@/models/puzzle.models";
import GridCell from "./GridCell";

interface GridProps {
  board: GameBoard;
  hints: GameBoard;
  focusedCell: [number, number] | null;
  selectedCell: [number, number] | null;
  cellHighlights: Record<string, HighlightType>;
  onCellClick: (r: number, c: number) => void;
  onCellRightClick: (r: number, c: number) => void;
}

export default function Grid({
  board,
  hints,
  focusedCell,
  selectedCell,
  cellHighlights,
  onCellClick,
  onCellRightClick,
}: GridProps) {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Sun bar */}
      <div className="w-full bg-gradient-to-b from-sun/35 via-sun/10 to-transparent rounded-t-[min(5vw,22px)] py-2 pb-2.5 flex items-center justify-center gap-1.5">
        <Sun size={24} className="text-[#8B6914]" />
        <span className="font-body text-lg font-semibold text-[#8B6914] tracking-[0.04em]">
          {t("puzzle.sunlight")}
        </span>
        <ArrowDown size={20} className="text-[#8B6914]/40" />
      </div>

      {/* Grid */}
      <div className="w-full grid grid-cols-4 gap-[min(1.8vw,7px)] p-[min(3.5vw,14px)] bg-gradient-to-b from-sun/[0.03] via-sage/[0.07] to-sage/[0.13] rounded-b-[min(5vw,22px)] border-2 border-sage-light/40 border-t-0 shadow-[0_4px_20px_theme(--color-sage/0.09)]">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r}-${c}`;
            const cons = cell ? getConstraints(board, r, c) : [];
            const hasViolation = cons.some((cn) => !cn.met);
            const allHappy = !!cell && cons.length > 0 && !hasViolation;
            return (
              <GridCell
                key={key}
                plant={cell}
                isHint={hints[r][c] !== null}
                isSelected={!!selectedCell && selectedCell[0] === r && selectedCell[1] === c}
                isFocused={!!focusedCell && focusedCell[0] === r && focusedCell[1] === c}
                hasViolation={hasViolation}
                allHappy={allHappy}
                highlight={cellHighlights[key] ?? null}
                onClick={() => onCellClick(r, c)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onCellRightClick(r, c);
                }}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}
