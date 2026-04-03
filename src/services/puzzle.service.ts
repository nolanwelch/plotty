import { PuzzlePiece, type PuzzleSpecification } from "@/models/puzzle.models";

export function makePuzzleService() {
  return {
    getPuzzleByDate(_date: Date): PuzzleSpecification {
      return {
        startingGrid: [
          [
            PuzzlePiece.enum.EMPTY,
            PuzzlePiece.enum.MARIGOLD,
            PuzzlePiece.enum.EMPTY,
            PuzzlePiece.enum.EMPTY,
          ],
          [
            PuzzlePiece.enum.EMPTY,
            PuzzlePiece.enum.TOMATO,
            PuzzlePiece.enum.CARROT,
            PuzzlePiece.enum.BEAN,
          ],
          [
            PuzzlePiece.enum.EMPTY,
            PuzzlePiece.enum.EMPTY,
            PuzzlePiece.enum.ONION,
            PuzzlePiece.enum.EMPTY,
          ],
          [
            PuzzlePiece.enum.TOMATO,
            PuzzlePiece.enum.BASIL,
            PuzzlePiece.enum.MARIGOLD,
            PuzzlePiece.enum.EMPTY,
          ],
        ],
        difficulty: "1",
        additionalPieces: [
          PuzzlePiece.enum.BASIL,
          PuzzlePiece.enum.BEAN,
          PuzzlePiece.enum.CORN,
          PuzzlePiece.enum.CORN,
          PuzzlePiece.enum.ONION,
          PuzzlePiece.enum.TOMATO,
          PuzzlePiece.enum.TOMATO,
          PuzzlePiece.enum.TOMATO,
        ],
      };
    },
  };
}

export type PuzzleService = ReturnType<typeof makePuzzleService>;
