"""Where a date sits on the timeline under the score.

The timeline is stretched so that each section of the page gets about a minute of 4part.
Each section's date is pinned to that section's place in the music (its data-f), and dates
in between are spaced evenly. Usage:  python3 _planning/tools/timeline.py 2026-10-03
"""
import sys, bisect
LEN = 593.32
def mo(y, m, d=1): return ((y - 2025) * 12 + (m - 1) + (d - 1) / 30) / 25 * 100
# (date, seconds into the piece) for each section; keep in step with the data-f values in index.html
ANCHORS = [((2025, 1, 1), 0), ((2025, 4, 26), 58.5), ((2025, 11, 1), 116.1), ((2026, 5, 30), 233.7),
           ((2026, 6, 1), 292.5), ((2026, 7, 15), 349.5), ((2026, 9, 24), 409.5), ((2026, 11, 19), 467.25),
           ((2027, 1, 1), 524.25), ((2027, 2, 1), LEN)]
A = [(mo(*d), t / LEN * 100) for d, t in ANCHORS]
def x(y, m, d=1):
    u = mo(y, m, d); us = [a[0] for a in A]
    i = max(0, min(len(A) - 2, bisect.bisect_right(us, u) - 1))
    (u0, x0), (u1, x1) = A[i], A[i + 1]
    return x0 + (x1 - x0) * (u - u0) / (u1 - u0)
if __name__ == '__main__':
    for arg in sys.argv[1:]:
        y, m, d = map(int, arg.split('-'))
        print(f'{arg}: left {x(y, m, d):.2f}%')
