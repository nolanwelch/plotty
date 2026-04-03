import type { Constraint, GameBoard, PlantType } from "@/models/puzzle.models";
import { GRID_SIZE, PLANTS } from "./plants";

export function getNeighbors(r: number, c: number): [number, number][] {
  const result: [number, number][] = [];
  for (const [dr, dc] of [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
      result.push([nr, nc]);
    }
  }
  return result;
}

export function getConstraints(board: GameBoard, r: number, c: number): Constraint[] {
  const plant = board[r][c];
  if (!plant) return [];

  const neighbors = getNeighbors(r, c);
  const constraints: Constraint[] = [];

  const neighborsOf = (type: PlantType) => neighbors.filter(([nr, nc]) => board[nr][nc] === type);
  const hasNeighbor = (type: PlantType) => neighborsOf(type).length > 0;
  const emptyNeighbors = neighbors.filter(([nr, nc]) => !board[nr][nc]);

  if (plant === "TOMATO") {
    constraints.push({
      type: "companion",
      labelKey: "constraints.tomatoCompanion",
      met: hasNeighbor("BASIL"),
      cells: hasNeighbor("BASIL") ? neighborsOf("BASIL") : emptyNeighbors,
      targetPlant: "BASIL",
    });
    constraints.push({
      type: "antagonist",
      labelKey: "constraints.tomatoAntagonistCorn",
      met: !hasNeighbor("CORN"),
      cells: neighborsOf("CORN"),
      targetPlant: "CORN",
    });
    constraints.push({
      type: "antagonist",
      labelKey: "constraints.tomatoAntagonistBean",
      met: !hasNeighbor("BEAN"),
      cells: neighborsOf("BEAN"),
      targetPlant: "BEAN",
    });
    constraints.push({
      type: "trait",
      labelKey: "constraints.tomatoTrait",
      met: true,
      cells: r < GRID_SIZE - 1 ? [[r + 1, c]] : [],
      targetPlant: null,
    });
  } else if (plant === "BASIL") {
    constraints.push({
      type: "companion",
      labelKey: "constraints.basilCompanion",
      met: hasNeighbor("TOMATO"),
      cells: hasNeighbor("TOMATO") ? neighborsOf("TOMATO") : emptyNeighbors,
      targetPlant: "TOMATO",
    });
    const above: [number, number] | null = r > 0 ? [r - 1, c] : null;
    const abovePlant = above ? board[above[0]][above[1]] : null;
    const shadeOk = above && abovePlant && PLANTS[abovePlant]?.tall;
    const shadeFail = r === 0 || (abovePlant && !PLANTS[abovePlant]?.tall);
    constraints.push({
      type: "shade",
      labelKey: "constraints.basilShade",
      met: !!shadeOk,
      pending: !shadeFail && !shadeOk,
      cells: above ? [above] : [],
      targetPlant: null,
    });
  } else if (plant === "CARROT") {
    constraints.push({
      type: "companion",
      labelKey: "constraints.carrotCompanion",
      met: hasNeighbor("ONION"),
      cells: hasNeighbor("ONION") ? neighborsOf("ONION") : emptyNeighbors,
      targetPlant: "ONION",
    });
    constraints.push({
      type: "antagonist",
      labelKey: "constraints.carrotAntagonist",
      met: !hasNeighbor("MARIGOLD"),
      cells: neighborsOf("MARIGOLD"),
      targetPlant: "MARIGOLD",
    });
  } else if (plant === "ONION") {
    constraints.push({
      type: "companion",
      labelKey: "constraints.onionCompanion",
      met: hasNeighbor("CARROT"),
      cells: hasNeighbor("CARROT") ? neighborsOf("CARROT") : emptyNeighbors,
      targetPlant: "CARROT",
    });
    constraints.push({
      type: "antagonist",
      labelKey: "constraints.onionAntagonist",
      met: !hasNeighbor("BEAN"),
      cells: neighborsOf("BEAN"),
      targetPlant: "BEAN",
    });
  } else if (plant === "BEAN") {
    constraints.push({
      type: "companion",
      labelKey: "constraints.beanCompanion",
      met: hasNeighbor("CORN"),
      cells: hasNeighbor("CORN") ? neighborsOf("CORN") : emptyNeighbors,
      targetPlant: "CORN",
    });
    constraints.push({
      type: "antagonist",
      labelKey: "constraints.beanAntagonistOnion",
      met: !hasNeighbor("ONION"),
      cells: neighborsOf("ONION"),
      targetPlant: "ONION",
    });
    constraints.push({
      type: "antagonist",
      labelKey: "constraints.beanAntagonistTomato",
      met: !hasNeighbor("TOMATO"),
      cells: neighborsOf("TOMATO"),
      targetPlant: "TOMATO",
    });
  } else if (plant === "CORN") {
    constraints.push({
      type: "companion",
      labelKey: "constraints.cornCompanion",
      met: hasNeighbor("BEAN"),
      cells: hasNeighbor("BEAN") ? neighborsOf("BEAN") : emptyNeighbors,
      targetPlant: "BEAN",
    });
    constraints.push({
      type: "antagonist",
      labelKey: "constraints.cornAntagonist",
      met: !hasNeighbor("TOMATO"),
      cells: neighborsOf("TOMATO"),
      targetPlant: "TOMATO",
    });
    constraints.push({
      type: "trait",
      labelKey: "constraints.cornTrait",
      met: true,
      cells: r < GRID_SIZE - 1 ? [[r + 1, c]] : [],
      targetPlant: null,
    });
  } else if (plant === "MARIGOLD") {
    constraints.push({
      type: "antagonist",
      labelKey: "constraints.marigoldAntagonistSelf",
      met: !hasNeighbor("MARIGOLD"),
      cells: neighborsOf("MARIGOLD"),
      targetPlant: "MARIGOLD",
    });
    constraints.push({
      type: "antagonist",
      labelKey: "constraints.marigoldAntagonistCarrot",
      met: !hasNeighbor("CARROT"),
      cells: neighborsOf("CARROT"),
      targetPlant: "CARROT",
    });
    const onBorder = r === 0 || r === GRID_SIZE - 1 || c === 0 || c === GRID_SIZE - 1;
    constraints.push({
      type: "position",
      labelKey: "constraints.marigoldPosition",
      met: onBorder,
      cells: [],
      targetPlant: null,
    });
  }

  return constraints;
}

export function isAllHappy(board: GameBoard, r: number, c: number): boolean {
  const cons = getConstraints(board, r, c);
  return cons.length > 0 && cons.every((c) => c.met);
}

export function checkFullBoard(board: GameBoard): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!board[r][c]) return false;
      if (!isAllHappy(board, r, c)) return false;
    }
  }
  return true;
}
