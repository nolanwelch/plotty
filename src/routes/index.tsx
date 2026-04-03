import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { getDailyPuzzle } from "@/activities/getDailyPuzzle.activity";
import ConstraintChecklist from "@/components/puzzle/ConstraintChecklist";
import Grid from "@/components/puzzle/Grid";
import PlantTray from "@/components/puzzle/PlantTray";
// import RulesPanel from "@/components/puzzle/RulesPanel";
import WinModal from "@/components/puzzle/WinModal";
import { usePuzzleGame } from "@/hooks/usePuzzleGame";
import { t } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  loader: () => getDailyPuzzle(),
  component: PuzzlePage,
});

function PuzzlePage() {
  const data = Route.useLoaderData();
  const game = usePuzzleGame(data);

  const canRemove =
    !!game.focusedCell &&
    !!game.board[game.focusedCell[0]]?.[game.focusedCell[1]] &&
    !game.isHint(game.focusedCell[0], game.focusedCell[1]);

  return (
    <div className="h-full bg-gradient-to-b from-parchment to-[#e2e3c2] font-body flex flex-col items-center justify-center px-2 py-1 lg:px-4 lg:py-3">
      {/* Wordmark — hidden when viewport is short on mobile */}
      <div className="hidden tall-viewport:block lg:block text-center mb-9 lg:mb-2 lg:-mt-2">
        <span className="font-display text-[min(6vw,24px)] lg:text-5xl font-semibold text-sage leading-none">
          {t("header.title")}
        </span>
        <span className="block text-[min(2.5vw,11px)] lg:text-[21px] text-loam tracking-[0.06em] font-medium font-body">
          {t("header.subtitle")}
        </span>
      </div>

      {/* Main area: stacked on mobile, side-by-side on md+ */}
      <div className="w-full max-w-[960px] flex flex-col lg:flex-row lg:items-stretch lg:justify-center gap-[min(1.5vh,8px)] lg:gap-6">
        {/* Grid with mobile action buttons */}
        <div className="relative w-[min(88vw,58vh,420px)] mx-auto lg:mx-0 lg:w-[min(55vh,500px)] lg:flex-shrink-0">
          {/* Mobile: reset top-left, remove top-right */}
          <button
            type="button"
            onClick={game.resetBoard}
            className="lg:hidden absolute -top-8 left-0 font-body text-sm font-semibold bg-cream text-loam border-[1.5px] border-cream-dark rounded-lg py-1 px-3 cursor-pointer z-10"
          >
            {"\u21BA"} {t("puzzle.reset")}
          </button>
          <button
            type="button"
            disabled={!canRemove}
            onClick={() => {
              if (game.focusedCell) {
                game.removePiece(game.focusedCell[0], game.focusedCell[1]);
              }
            }}
            className={`lg:hidden absolute -top-8 right-0 font-body text-sm font-semibold rounded-lg py-1 px-3 flex items-center gap-1 cursor-pointer border-[1.5px] transition-all duration-150 z-10 ${
              canRemove
                ? "bg-error/[0.06] text-error border-error/30"
                : "bg-cream text-loam/30 border-cream-dark cursor-default"
            }`}
          >
            <Trash2 size={14} />
            {t("constraints.remove")}
          </button>

          <Grid
            board={game.board}
            hints={game.hints}
            focusedCell={game.focusedCell}
            selectedCell={game.selectedCell}
            cellHighlights={game.cellHighlights}
            onCellClick={game.handleCellClick}
            onCellRightClick={(r, c) => game.removePiece(r, c)}
          />
        </div>

        {/* Right column (desktop) / bottom section (mobile) */}
        <div className="flex flex-col items-center lg:items-stretch lg:justify-between gap-1.5 lg:gap-0 lg:flex-1 lg:min-w-[280px] lg:max-w-[400px]">
          <PlantTray
            selectedPiece={game.selectedPiece}
            remaining={game.remaining}
            onPieceClick={game.handlePieceClick}
          />

          {/* Constraint checklist */}
          <div className="w-full h-[100px] lg:h-[160px] bg-cream rounded-[14px] border-[1.5px] border-cream-dark flex flex-col">
            <ConstraintChecklist
              constraints={game.focusedConstraints}
              plant={
                game.focusedCell
                  ? (game.board[game.focusedCell[0]][game.focusedCell[1]] ?? null)
                  : null
              }
              focusedCell={game.focusedCell}
              previewPlant={game.previewPlant}
            />
          </div>

          {/* Actions — desktop only */}
          <div className="hidden lg:flex items-center justify-between w-full">
            <button
              type="button"
              onClick={game.resetBoard}
              className="font-body text-[15px] font-semibold bg-cream text-loam border-[1.5px] border-cream-dark rounded-[10px] py-2.5 px-6 cursor-pointer"
            >
              {"\u21BA"} {t("puzzle.reset")}
            </button>
            <button
              type="button"
              disabled={!canRemove}
              onClick={() => {
                if (game.focusedCell) {
                  game.removePiece(game.focusedCell[0], game.focusedCell[1]);
                }
              }}
              className={`font-body text-[15px] font-semibold rounded-[10px] py-2.5 px-5 flex items-center gap-1.5 cursor-pointer border-[1.5px] transition-all duration-150 ${
                canRemove
                  ? "bg-error/[0.06] text-error border-error/30 hover:bg-error/[0.12]"
                  : "bg-cream text-loam/30 border-cream-dark cursor-default"
              }`}
            >
              <Trash2 size={15} />
              {t("constraints.remove")}
            </button>
          </div>

          {/* How to play — hidden on mobile */}
          <div className="hidden lg:block px-2 text-lg text-loam text-left leading-6">
            <strong>{t("puzzle.howToPlay")}</strong> {t("puzzle.howToPlayBody")}
          </div>
        </div>
      </div>

      {/* TODO: RulesPanel — commented out until we design a landscape-friendly layout
      <div className="w-full max-w-[420px]">
        <RulesPanel
          expanded={game.rulesOpen}
          onToggle={() => game.setRulesOpen(!game.rulesOpen)}
        />
      </div>
      */}

      {game.won && (
        <WinModal
          moves={game.moves}
          difficulty={game.difficulty}
          onClose={() => game.setWon(false)}
        />
      )}
    </div>
  );
}
