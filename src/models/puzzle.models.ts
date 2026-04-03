import { z } from "zod";
import type { TranslationKey } from "@/lib/i18n";

export const PuzzlePiece = z.enum([
  "EMPTY",
  "BASIL",
  "BEAN",
  "CARROT",
  "CORN",
  "MARIGOLD",
  "ONION",
  "TOMATO",
]);
export type PuzzlePiece = z.infer<typeof PuzzlePiece>;

export const PuzzleDifficulty = z.enum(["1", "2", "3", "4", "5"]);
export type PuzzleDifficulty = z.infer<typeof PuzzleDifficulty>;

export const PuzzleSpecification = z.object({
  startingGrid: z.array(z.array(PuzzlePiece)),
  additionalPieces: z.array(PuzzlePiece.exclude(["EMPTY"])),
  difficulty: PuzzleDifficulty,
});
export type PuzzleSpecification = z.infer<typeof PuzzleSpecification>;

// ── Derived types for game logic ──

export type PlantType = Exclude<PuzzlePiece, "EMPTY">;

export type ConstraintType = "companion" | "antagonist" | "shade" | "trait" | "position";

export type HighlightType = "companion" | "antagonist" | "shade" | "trait" | "empty-hint";

export type GameBoard = (PlantType | null)[][];

export interface Constraint {
  type: ConstraintType;
  labelKey: TranslationKey;
  met: boolean;
  pending?: boolean;
  cells: [number, number][];
  targetPlant: PlantType | null;
}

export interface PlantInfo {
  emoji: string;
  nameKey: TranslationKey;
  tall: boolean;
}

export interface PlantRule {
  type: ConstraintType;
  labelKey: TranslationKey;
}
