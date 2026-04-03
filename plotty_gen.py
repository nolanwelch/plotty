"""
Plotty puzzle generator v3 — tier-aware generation.
Weighted bag draws, cascade-priority hint selection.
Generates one puzzle per tier and outputs as JSON for the frontend.
"""
import random
import time
import json
from collections import Counter

N = 4
TOMATO, BASIL, CARROT, ONION, BEAN, CORN, MARIGOLD = 0, 1, 2, 3, 4, 5, 6
NAMES = ["TOMATO", "BASIL", "CARROT", "ONION", "BEAN", "CORN", "MARIGOLD"]
EMOJI = ["🍅", "🌿", "🥕", "🧅", "🫘", "🌽", "🌼"]
TALL = {TOMATO, CORN}
BORDER = {(r,c) for r in range(N) for c in range(N) if r==0 or r==N-1 or c==0 or c==N-1}

NEIGHBORS = {}
for r in range(N):
    for c in range(N):
        NEIGHBORS[(r,c)] = [(nr,nc) for nr,nc in [(r-1,c),(r+1,c),(r,c-1),(r,c+1)]
                            if 0 <= nr < N and 0 <= nc < N]

# Tier-specific bag weights: [TOMATO, BASIL, CARROT, ONION, BEAN, CORN, MARIGOLD]
TIER_BAGS = {
    "seedling":  [3, 3, 3, 3, 3, 3, 7],  # heavy marigold = more border constraints
    "sprout":    [3, 3, 3, 3, 3, 3, 6],
    "bloom":     [3, 3, 3, 3, 3, 3, 5],
    "gardener":  [3, 3, 3, 3, 3, 3, 4],
    "master":    [3, 3, 3, 3, 3, 3, 3],   # flat = unpredictable
}

TIER_HINT_RANGE = {
    "seedling":  (8, 11),
    "sprout":    (6, 8),
    "bloom":     (4, 6),
    "gardener":  (2, 4),
    "master":    (1, 2),
}

def draw_pieces(bag_weights, rng):
    """Draw 16 pieces from weighted bag without replacement-style (with replacement from bag)."""
    bag = []
    for plant, weight in enumerate(bag_weights):
        bag.extend([plant] * weight)
    drawn = []
    for _ in range(16):
        drawn.append(rng.choice(bag))
    return drawn

def check_rules(board):
    for r in range(N):
        for c in range(N):
            plant = board[r][c]
            adj = [board[nr][nc] for nr, nc in NEIGHBORS[(r,c)]]
            if plant == TOMATO:
                if BASIL not in adj or CORN in adj: return False
            elif plant == BASIL:
                if TOMATO not in adj: return False
                if r == 0: return False
                if board[r-1][c] not in TALL: return False
            elif plant == CARROT:
                if ONION not in adj or MARIGOLD in adj: return False
            elif plant == ONION:
                if CARROT not in adj or BEAN in adj: return False
            elif plant == BEAN:
                if CORN not in adj or ONION in adj or TOMATO in adj: return False
            elif plant == CORN:
                if BEAN not in adj or TOMATO in adj: return False
            elif plant == MARIGOLD:
                if MARIGOLD in adj or CARROT in adj: return False
                if (r,c) not in BORDER: return False
    return True

def local_feasible(board, r, c, plant):
    adj_plants = [board[nr][nc] for nr,nc in NEIGHBORS[(r,c)] if board[nr][nc] is not None]
    if plant == BASIL:
        if r == 0: return False
        above = board[r-1][c]
        if above is not None and above not in TALL: return False
    if plant == MARIGOLD:
        if (r,c) not in BORDER: return False
        if MARIGOLD in adj_plants or CARROT in adj_plants: return False
    if plant == TOMATO and CORN in adj_plants: return False
    if plant == CORN and TOMATO in adj_plants: return False
    if plant == BEAN and (ONION in adj_plants or TOMATO in adj_plants): return False
    if plant == ONION and BEAN in adj_plants: return False
    if plant == CARROT and MARIGOLD in adj_plants: return False
    return True

def get_feasible(board, r, c, piece_counts):
    return [p for p in range(7) if piece_counts[p] > 0 and local_feasible(board, r, c, p)]

def solve_mrv(board, piece_counts, empty_cells, max_solutions=2):
    if not empty_cells:
        return [[row[:] for row in board]] if check_rules(board) else []

    best_idx, best_feasible, best_count = None, None, 999
    for idx, (r, c) in enumerate(empty_cells):
        feasible = get_feasible(board, r, c, piece_counts)
        if len(feasible) == 0: return []
        if len(feasible) < best_count:
            best_count = len(feasible)
            best_idx = idx
            best_feasible = feasible
            if best_count == 1: break

    r, c = empty_cells[best_idx]
    remaining_cells = empty_cells[:best_idx] + empty_cells[best_idx+1:]

    solutions = []
    for plant in best_feasible:
        board[r][c] = plant
        piece_counts[plant] -= 1
        found = solve_mrv(board, piece_counts, remaining_cells, max_solutions - len(solutions))
        solutions.extend(found)
        if len(solutions) >= max_solutions:
            board[r][c] = None
            piece_counts[plant] += 1
            return solutions
        board[r][c] = None
        piece_counts[plant] += 1
    return solutions

def solve(board, pieces, max_solutions=2):
    counts = [0]*7
    for p in pieces: counts[p] += 1
    empty = [(r,c) for r in range(N) for c in range(N) if board[r][c] is None]
    return solve_mrv(board, counts, empty, max_solutions)

def cascade_count(board, hints, pieces):
    """Count cells solvable by single-candidate logic from given hints."""
    b = [[None]*N for _ in range(N)]
    counts = [0]*7
    for p in pieces: counts[p] += 1
    for r, c in hints:
        plant = board[r][c]
        b[r][c] = plant
        counts[plant] -= 1

    filled = 0
    progress = True
    while progress:
        progress = False
        for r in range(N):
            for c in range(N):
                if b[r][c] is not None: continue
                feasible = [p for p in range(7) if counts[p] > 0 and local_feasible(b, r, c, p)]
                if len(feasible) == 1:
                    b[r][c] = feasible[0]
                    counts[feasible[0]] -= 1
                    filled += 1
                    progress = True
    return filled

def cell_cascade_power(solution, pieces, cell):
    """How many cells become forced if we reveal just this one cell?"""
    return cascade_count(solution, [cell], pieces)

def find_hints_for_tier(solution, pieces, tier, rng, max_attempts=10):
    """
    Find hints using tier-appropriate strategy.
    Easy: cascade-maximizing order, then add bonus hints.
    Hard: isolation-maximizing order (low cascade power first).
    """
    lo, hi = TIER_HINT_RANGE[tier]
    is_easy = tier in ("seedling", "sprout")
    is_hard = tier in ("gardener", "master")

    all_cells = [(r,c) for r in range(N) for c in range(N)]

    for attempt in range(max_attempts):
        # Score each cell by cascade power
        scores = {}
        for cell in all_cells:
            scores[cell] = cell_cascade_power(solution, pieces, cell)

        if is_easy:
            # Reveal high-cascade cells first → fewer hints needed for uniqueness
            # Then we'll pad with bonus hints
            ordered = sorted(all_cells, key=lambda c: -scores[c])
        elif is_hard:
            # Reveal low-cascade cells first → more hints needed, but we stop early
            ordered = sorted(all_cells, key=lambda c: scores[c])
        else:
            # Bloom: mix — some cascade, some not
            rng.shuffle(all_cells)
            ordered = sorted(all_cells, key=lambda c: -scores[c] * 0.5 + rng.random())

        # Add some randomness to break ties and vary puzzles
        # Group by score and shuffle within groups
        from itertools import groupby
        if is_easy or is_hard:
            grouped = []
            for _key, group in groupby(ordered, key=lambda c: scores[c]):
                g = list(group)
                rng.shuffle(g)
                grouped.extend(g)
            ordered = grouped

        # Reveal cells in order until unique
        hint_set = []
        hint_board = [[None]*N for _ in range(N)]
        remaining = list(pieces)

        for r, c in ordered:
            plant = solution[r][c]
            hint_board[r][c] = plant
            hint_set.append((r, c))
            remaining.remove(plant)

            test = [row[:] for row in hint_board]
            sols = solve(test, list(remaining), max_solutions=2)

            if len(sols) == 1:
                # We have uniqueness with len(hint_set) hints
                min_hints = len(hint_set)

                if is_easy and min_hints < lo:
                    # Add bonus hints (reveal already-forced cells for comfort)
                    bonus_candidates = [(br, bc) for br, bc in all_cells
                                       if (br, bc) not in hint_set]
                    rng.shuffle(bonus_candidates)
                    while len(hint_set) < lo and bonus_candidates:
                        bonus = bonus_candidates.pop()
                        hint_set.append(bonus)
                        hint_board[bonus[0]][bonus[1]] = solution[bonus[0]][bonus[1]]

                if lo <= len(hint_set) <= hi:
                    return hint_set
                elif len(hint_set) < lo:
                    # Too few hints even after bonuses — shouldn't happen for easy
                    break
                else:
                    # Too many hints — retry with different randomization
                    break

    return None


def generate_puzzle(tier, seed):
    """Generate a single puzzle for the given tier."""
    rng = random.Random(seed)
    bag = TIER_BAGS[tier]

    for attempt in range(100):
        pieces = draw_pieces(bag, rng)

        # Check we have a solvable set
        board = [[None]*N for _ in range(N)]
        sols = solve(board, pieces, max_solutions=1)
        if not sols:
            continue

        solution = sols[0]

        # Find tier-appropriate hints
        hints = find_hints_for_tier(solution, pieces, tier, rng)
        if hints is None:
            continue

        # Build output
        hint_board = [[None]*N for _ in range(N)]
        remaining_counts = [0]*7
        for p in pieces: remaining_counts[p] += 1
        for r, c in hints:
            hint_board[r][c] = NAMES[solution[r][c]]
            remaining_counts[solution[r][c]] -= 1

        solution_names = [[NAMES[solution[r][c]] for c in range(N)] for r in range(N)]
        pieces_dict = {NAMES[i]: remaining_counts[i] for i in range(7)}

        return {
            "solution": solution_names,
            "hints": [[hint_board[r][c] for c in range(N)] for r in range(N)],
            "pieces": pieces_dict,
            "hint_count": len(hints),
            "tier": tier,
            "seed": seed,
            "attempt": attempt,
        }

    return None


def main():
    tiers = ["seedling", "sprout", "bloom", "gardener", "master"]
    results = {}

    for tier in tiers:
        print(f"Generating {tier}...")
        t0 = time.time()

        # Try multiple seeds to find a good one
        for seed in range(1000):
            result = generate_puzzle(tier, seed * 31 + 7)
            if result:
                elapsed = time.time() - t0
                print(f"  ✓ {tier}: {result['hint_count']} hints, seed={seed}, {elapsed:.1f}s")
                results[tier] = result
                break
        else:
            print(f"  ✗ {tier}: FAILED")

    # Print as JS-ready object
    print("\n" + "="*60)
    print("PUZZLES FOR FRONTEND")
    print("="*60)

    tier_meta = {
        "seedling": (1, "Seedling", "Monday"),
        "sprout":   (2, "Sprout", "Tuesday"),
        "bloom":    (3, "Bloom", "Wednesday"),
        "gardener": (4, "Gardener", "Thursday"),
        "master":   (5, "Master", "Friday"),
    }

    for tier in tiers:
        if tier not in results:
            continue
        r = results[tier]
        num, name, day = tier_meta[tier]
        print(f"\n  {tier}: {{")
        print(f"    solution: {json.dumps(r['solution'])},")
        print(f"    hints: {json.dumps(r['hints'])},")
        print(f"    pieces: {json.dumps(r['pieces'])},")
        print(f"    tier: {num}, name: \"{name}\", day: \"{day}\",")
        print(f"  }},  // {r['hint_count']} hints")

    # Also print the boards visually
    print("\n" + "="*60)
    print("VISUAL PREVIEW")
    print("="*60)

    for tier in tiers:
        if tier not in results:
            continue
        r = results[tier]
        num, name, day = tier_meta[tier]
        print(f"\n--- {name} ({r['hint_count']} hints) ---")
        print("  Hints:                    Solution:")
        for row_idx in range(N):
            hint_row = ""
            sol_row = ""
            for c in range(N):
                h = r["hints"][row_idx][c]
                s = r["solution"][row_idx][c]
                hint_row += (EMOJI[NAMES.index(h)] if h else "⬜") + " "
                sol_row += EMOJI[NAMES.index(s)] + " "
            print(f"  {hint_row}      {sol_row}")
        remaining = r["pieces"]
        total = sum(remaining.values())
        print(f"  Pieces to place: {total}")
        for plant, count in remaining.items():
            if count > 0:
                print(f"    {EMOJI[NAMES.index(plant)]} {plant}: {count}")


if __name__ == "__main__":
    main()