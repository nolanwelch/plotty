import { useCallback, useEffect, useMemo, useState } from "react";
import { PLANTS } from "@/lib/plants";
import { checkFullBoard, getConstraints } from "@/lib/puzzle-logic";
import type {
  Constraint,
  GameBoard,
  HighlightType,
  PlantType,
  PuzzleSpecification,
} from "@/models/puzzle.models";

function specToBoard(spec: PuzzleSpecification): GameBoard {
  return spec.startingGrid.map((row) => row.map((cell) => (cell === "EMPTY" ? null : cell)));
}

function specToRemaining(spec: PuzzleSpecification): Record<PlantType, number> {
  const counts = Object.fromEntries(Object.keys(PLANTS).map((k) => [k, 0])) as Record<
    PlantType,
    number
  >;
  for (const piece of spec.additionalPieces) {
    counts[piece]++;
  }
  return counts;
}

export function usePuzzleGame(spec: PuzzleSpecification) {
  const hints = useMemo(() => specToBoard(spec), [spec]);
  const initBoard = useCallback(() => hints.map((row) => [...row]), [hints]);
  const initRemaining = useCallback(() => specToRemaining(spec), [spec]);

  const [board, setBoard] = useState<GameBoard>(initBoard);
  const [selectedPiece, setSelectedPiece] = useState<PlantType | null>(null);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [focusedCell, setFocusedCell] = useState<[number, number] | null>(null);
  const [remaining, setRemaining] = useState<Record<PlantType, number>>(initRemaining);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [previewPlant, setPreviewPlant] = useState<PlantType | null>(null);

  useEffect(() => {
    setBoard(initBoard());
    setRemaining(initRemaining());
    setSelectedPiece(null);
    setSelectedCell(null);
    setFocusedCell(null);
    setPreviewPlant(null);
    setMoves(0);
    setWon(false);
  }, [initBoard, initRemaining]);

  const isHint = useCallback((r: number, c: number) => hints[r][c] !== null, [hints]);

  const placePiece = useCallback(
    (r: number, c: number, type: PlantType) => {
      if (isHint(r, c) || remaining[type] <= 0) return;
      const newBoard = board.map((row) => [...row]);
      const prev = newBoard[r][c];
      if (prev) {
        setRemaining((rem) => ({ ...rem, [prev]: rem[prev] + 1, [type]: rem[type] - 1 }));
      } else {
        setRemaining((rem) => ({ ...rem, [type]: rem[type] - 1 }));
      }
      newBoard[r][c] = type;
      setBoard(newBoard);
      setMoves((m) => m + 1);
      setSelectedPiece(null);
      setSelectedCell(null);
      setPreviewPlant(null);
      setFocusedCell([r, c]);
      if (checkFullBoard(newBoard)) setTimeout(() => setWon(true), 500);
    },
    [board, remaining, isHint],
  );

  const removePiece = useCallback(
    (r: number, c: number) => {
      if (isHint(r, c) || !board[r][c]) return;
      const newBoard = board.map((row) => [...row]);
      const plant = newBoard[r][c] as PlantType;
      newBoard[r][c] = null;
      setBoard(newBoard);
      setRemaining((rem) => ({ ...rem, [plant]: rem[plant] + 1 }));
      setFocusedCell([r, c]);
    },
    [board, isHint],
  );

  const handleCellClick = useCallback(
    (r: number, c: number) => {
      setPreviewPlant(null);
      // Toggle focus off if clicking the same cell again
      if (focusedCell && focusedCell[0] === r && focusedCell[1] === c) {
        setFocusedCell(null);
        setSelectedCell(null);
        return;
      }
      setFocusedCell([r, c]);
      if (isHint(r, c)) return;
      if (selectedPiece) {
        placePiece(r, c, selectedPiece);
      } else if (!board[r][c] && selectedCell && selectedCell[0] === r && selectedCell[1] === c) {
        setSelectedCell(null);
      } else if (!board[r][c]) {
        setSelectedCell([r, c]);
      }
    },
    [board, selectedPiece, selectedCell, focusedCell, isHint, placePiece],
  );

  const handlePieceClick = useCallback(
    (type: PlantType) => {
      if (remaining[type] <= 0) return;
      if (selectedCell) {
        placePiece(selectedCell[0], selectedCell[1], type);
      } else {
        const deselecting = selectedPiece === type;
        setSelectedPiece(deselecting ? null : type);
        setPreviewPlant(deselecting ? null : type);
        setFocusedCell(null);
      }
    },
    [remaining, selectedCell, selectedPiece, placePiece],
  );

  const resetBoard = useCallback(() => {
    setBoard(initBoard());
    setRemaining(initRemaining());
    setSelectedPiece(null);
    setSelectedCell(null);
    setFocusedCell(null);
    setPreviewPlant(null);
    setMoves(0);
    setWon(false);
  }, [initBoard, initRemaining]);

  const focusedConstraints: Constraint[] = useMemo(() => {
    if (!focusedCell) return [];
    const [r, c] = focusedCell;
    if (!board[r][c]) return [];
    return getConstraints(board, r, c);
  }, [focusedCell, board]);

  const cellHighlights: Record<string, HighlightType> = useMemo(() => {
    const highlights: Record<string, HighlightType> = {};
    if (!focusedCell) return highlights;
    for (const con of focusedConstraints) {
      for (const [cr, cc] of con.cells) {
        const key = `${cr}-${cc}`;
        if (con.type === "antagonist" && !con.met) {
          highlights[key] = "antagonist";
        } else if (con.type === "companion" && con.met && !highlights[key]) {
          highlights[key] = "companion";
        } else if (con.type === "companion" && !con.met && !highlights[key]) {
          highlights[key] = "empty-hint";
        } else if (con.type === "shade" && !highlights[key]) {
          highlights[key] = "shade";
        } else if (con.type === "trait" && !highlights[key]) {
          highlights[key] = "trait";
        }
      }
    }
    return highlights;
  }, [focusedCell, focusedConstraints]);

  const totalRemaining = useMemo(
    () => Object.values(remaining).reduce((a, b) => a + b, 0),
    [remaining],
  );

  return {
    board,
    hints,
    selectedPiece,
    selectedCell,
    focusedCell,
    remaining,
    moves,
    won,
    rulesOpen,
    previewPlant,
    focusedConstraints,
    cellHighlights,
    totalRemaining,
    difficulty: spec.difficulty,
    isHint,
    handleCellClick,
    handlePieceClick,
    resetBoard,
    removePiece,
    setRulesOpen,
    setWon,
  };
}
