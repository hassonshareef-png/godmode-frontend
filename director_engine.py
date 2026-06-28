# director_engine.py
# Director Mode Math Engine – patterns, rundowns, TTT, comparisons

def digits(n: int):
    return [int(d) for d in str(n)]

def to_number(ds):
    return int("".join(str(d) for d in ds))

# ─────────────────────────
# MATH RUNDOWNS (P3 / P4)
# ─────────────────────────

def generate_rundown(base: int, pattern):
    """
    base: 3- or 4-digit int
    pattern: list of ints (e.g. [1,1,1] or [1,2,3,4])
    returns: list of rows (each row is list of digits)
    """
    base_digits = digits(base)
    out = []

    for p in pattern:
        row = [(d + p) % 10 for d in base_digits]
        out.append(row)

    return out

# ─────────────────────────
# TIC-TAC-TOE GRIDS (P3)
# ─────────────────────────

def ttt_standard(base: int):
    """
    Standard 3x3 Tic-Tac-Toe from base.
    """
    a, b, c = digits(base)
    return [
        [a, b, c],
        [(a+1) % 10, (b+1) % 10, (c+1) % 10],
        [(a+2) % 10, (b+2) % 10, (c+2) % 10],
    ]

def ttt_first_plus1(base: int):
    a, b, c = digits(base)
    return [
        [(a+1) % 10, b, c],
        [(a+2) % 10, b, c],
        [(a+3) % 10, b, c],
    ]

def ttt_middle_plus1(base: int):
    a, b, c = digits(base)
    return [
        [a, (b+1) % 10, c],
        [a, (b+2) % 10, c],
        [a, (b+3) % 10, c],
    ]

def ttt_last_plus1(base: int):
    a, b, c = digits(base)
    return [
        [a, b, (c+1) % 10],
        [a, b, (c+2) % 10],
        [a, b, (c+3) % 10],
    ]

# ─────────────────────────
# NUMBER TRANSFORMATIONS
# ─────────────────────────

def plus_n(base: int, n: int):
    return [(d + n) % 10 for d in digits(base)]

def minus_n(base: int, n: int):
    return [(d - n) % 10 for d in digits(base)]

def plus_minus_workout(base: int, max_n: int = 4):
    """
    Complete plus/minus workout up to ±max_n.
    """
    out = {}
    for k in range(1, max_n + 1):
        out[f"+{k}"] = plus_n(base, k)
        out[f"-{k}"] = minus_n(base, k)
    return out

# ─────────────────────────
# WORKOUT VISUALIZERS
# ─────────────────────────

def as_grid(rows):
    """
    Convert list of digit rows into printable grid (list of strings).
    """
    return [" ".join(str(d) for d in row) for row in rows]

def workout_summary(base: int, pattern):
    """
    Quick summary object for UI.
    """
    grid = generate_rundown(base, pattern)
    return {
        "base": base,
        "pattern": pattern,
        "rows": grid,
        "grid_strings": as_grid(grid),
    }

# ─────────────────────────
# PATTERN COMPARISON TOOLS
# ─────────────────────────

def compare_grids(grid1, grid2):
    """
    Compare two grids (list of rows).
    Returns match count per position.
    """
    matches = 0
    total = 0
    for r1, r2 in zip(grid1, grid2):
        for d1, d2 in zip(r1, r2):
            total += 1
            if d1 == d2:
                matches += 1
    return {"matches": matches, "total": total}

def compare_rundowns(base: int, pattern1, pattern2):
    g1 = generate_rundown(base, pattern1)
    g2 = generate_rundown(base, pattern2)
    cmp = compare_grids(g1, g2)
    return {
        "base": base,
        "pattern1": pattern1,
        "pattern2": pattern2,
        "grid1": g1,
        "grid2": g2,
        "comparison": cmp,
    }


if __name__ == "__main__":
    # quick self-test
    base = 827
    p = [1, 1, 1]
    print("Rundown:", workout_summary(base, p))
    print("TTT:", ttt_standard(base))
    print("Plus/Minus:", plus_minus_workout(base))

        "matches": sum(1 for r1, r2 in zip(grid1, grid2) if r1 == r2),
        "differences": sum(1 for r1, r2 in zip(grid1, grid2) if r1 != r2),
    }
