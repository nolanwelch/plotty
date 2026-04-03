import type { PlantInfo, PlantRule, PlantType } from "@/models/puzzle.models";

export const GRID_SIZE = 4;

export const PLANTS: Record<PlantType, PlantInfo> = {
  TOMATO: { emoji: "\u{1F345}", nameKey: "plants.tomato", tall: true },
  BASIL: { emoji: "\u{1F33F}", nameKey: "plants.basil", tall: false },
  CARROT: { emoji: "\u{1F955}", nameKey: "plants.carrot", tall: false },
  ONION: { emoji: "\u{1F9C5}", nameKey: "plants.onion", tall: false },
  BEAN: { emoji: "\u{1FAD8}", nameKey: "plants.bean", tall: false },
  CORN: { emoji: "\u{1F33D}", nameKey: "plants.corn", tall: true },
  MARIGOLD: { emoji: "\u{1F33C}", nameKey: "plants.marigold", tall: false },
};

export const PLANT_RULES: Record<PlantType, PlantRule[]> = {
  TOMATO: [
    { type: "trait", labelKey: "constraints.tomatoTrait" },
    { type: "companion", labelKey: "constraints.tomatoCompanion" },
    { type: "antagonist", labelKey: "constraints.tomatoAntagonistCorn" },
    { type: "antagonist", labelKey: "constraints.tomatoAntagonistBean" },
  ],
  BASIL: [
    { type: "companion", labelKey: "constraints.basilCompanion" },
    { type: "shade", labelKey: "constraints.basilShade" },
  ],
  CARROT: [
    { type: "companion", labelKey: "constraints.carrotCompanion" },
    { type: "antagonist", labelKey: "constraints.carrotAntagonist" },
  ],
  ONION: [
    { type: "companion", labelKey: "constraints.onionCompanion" },
    { type: "antagonist", labelKey: "constraints.onionAntagonist" },
  ],
  BEAN: [
    { type: "companion", labelKey: "constraints.beanCompanion" },
    { type: "antagonist", labelKey: "constraints.beanAntagonistOnion" },
    { type: "antagonist", labelKey: "constraints.beanAntagonistTomato" },
  ],
  CORN: [
    { type: "trait", labelKey: "constraints.cornTrait" },
    { type: "companion", labelKey: "constraints.cornCompanion" },
    { type: "antagonist", labelKey: "constraints.cornAntagonist" },
  ],
  MARIGOLD: [
    { type: "antagonist", labelKey: "constraints.marigoldAntagonistSelf" },
    { type: "antagonist", labelKey: "constraints.marigoldAntagonistCarrot" },
    { type: "position", labelKey: "constraints.marigoldPosition" },
  ],
};
