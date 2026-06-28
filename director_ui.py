# director_ui.py
# Safe Director Mode UI logic

from director_rundowns import RUNDOWNS
from director_engine import generate_rundown, ttt_grid, compare_patterns

def list_rundowns():
    return sorted(RUNDOWNS.keys())

def run_rundown(base, name):
    pattern = RUNDOWNS[name]
    return generate_rundown(base, pattern)

def run_ttt(base):
    return ttt_grid(base)

def compare(base, r1, r2):
    g1 = run_rundown(base, r1)
    g2 = run_rundown(base, r2)
    return compare_patterns(g1, g2)
