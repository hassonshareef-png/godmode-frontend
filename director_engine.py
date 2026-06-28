# director_engine.py
# Safe mathematical rundown generator

def digits(n):
    return [int(d) for d in str(n)]

def generate_rundown(base, pattern):
    base_digits = digits(base)
    out = []

    for p in pattern:
        row = [(d + p) % 10 for d in base_digits]
        out.append(row)

    return out

def ttt_grid(base):
    a, b, c = digits(base)
    return [
        [a, b, c],
        [(a+1)%10, (b+1)%10, (c+1)%10],
        [(a+2)%10, (b+2)%10, (c+2)%10],
    ]

def compare_patterns(grid1, grid2):
    return {
        "matches": sum(1 for r1, r2 in zip(grid1, grid2) if r1 == r2),
        "differences": sum(1 for r1, r2 in zip(grid1, grid2) if r1 != r2),
    }
