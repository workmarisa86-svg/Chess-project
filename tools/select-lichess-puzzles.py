#!/usr/bin/env python3
"""
Pick the Levels puzzles from the Lichess open puzzle database (CC0).

  curl -LO https://database.lichess.org/lichess_db_puzzle.csv.zst
  pip install zstandard
  python3 -I tools/select-lichess-puzzles.py lichess_db_puzzle.csv.zst out.tsv

Writes one line per chosen puzzle, ordered by difficulty (Level 1 first):
  id <TAB> fen <TAB> moves <TAB> rating <TAB> themes
tools/build-levels.js then checks every line with the app's engine and
writes the compact chunks in data/levels/.
"""
import collections, csv, io, random, sys

TOTAL = 200_000
MATE_SHARE = 0.65
MATE_TAGS = {'mateIn3', 'mateIn4', 'mateIn5'}
BANNED = {'hangingPiece', 'oneMove', 'mateIn1', 'mateIn2'}
TACTIC_TAGS = {'sacrifice', 'deflection', 'attraction', 'clearance', 'interference', 'discoveredAttack',
               'doubleCheck', 'skewer', 'fork', 'pin', 'xRayAttack', 'intermezzo', 'quietMove', 'zugzwang',
               'capturingDefender', 'trappedPiece', 'exposedKing', 'defensiveMove', 'promotion', 'underPromotion',
               'advancedPawn', 'attackingF2F7', 'discoveredCheck', 'enPassant'}


ORDER = ['doubleCheck', 'discoveredCheck', 'discoveredAttack', 'skewer', 'fork', 'pin', 'deflection', 'attraction',
         'clearance', 'interference', 'xRayAttack', 'intermezzo', 'capturingDefender', 'trappedPiece', 'quietMove',
         'zugzwang', 'promotion', 'sacrifice']


def kind(rec):
    tags = rec[4].split()
    for t in tags:
        if t.endswith('Mate'):
            return t
    for t in ORDER:
        if t in tags:
            return t
    return 'mate' if 'mate' in tags else 'other'


def spread(lst, window=60):
    """Avoid runs of the same idea (e.g. many back-rank mates in a row):
    take the next puzzle whose kind differs from the last two, looking only a
    few places ahead so the difficulty still rises steadily."""
    out = []
    pending = collections.deque(lst)
    while pending:
        recent = [kind(x) for x in out[-2:]]
        pick = 0
        for j in range(min(window, len(pending))):
            if kind(pending[j]) not in recent:
                pick = j
                break
        pending.rotate(-pick)
        out.append(pending.popleft())
        pending.rotate(pick)
    return out


def main(src, dst):
    import zstandard
    mates, tactics = [], []
    with open(src, 'rb') as fh:
        reader = csv.reader(io.TextIOWrapper(zstandard.ZstdDecompressor().stream_reader(fh), encoding='utf-8'))
        header = next(reader)
        col = {k: i for i, k in enumerate(header)}
        for row in reader:
            try:
                rating = int(row[col['Rating']]); rd = int(row[col['RatingDeviation']])
                pop = int(row[col['Popularity']]); plays = int(row[col['NbPlays']])
            except ValueError:
                continue
            if rd >= 90 or pop < 85 or plays < 300:
                continue
            themes = row[col['Themes']].split()
            ts = set(themes)
            if ts & BANNED:
                continue
            moves = row[col['Moves']].split()
            solver = len(moves) // 2  # moves[0] is the opponent's move
            rec = (row[col['PuzzleId']], row[col['FEN']], ' '.join(moves), rating, ' '.join(themes))
            if ts & MATE_TAGS and 'mate' in ts:
                if solver >= 3:
                    mates.append(rec)
            elif 'mate' not in ts and rating >= 1600 and solver >= 2 and ts & TACTIC_TAGS:
                tactics.append(rec)
    print(f'candidates: {len(mates)} mates in 3+, {len(tactics)} hard tactics', file=sys.stderr)
    rnd = random.Random(20261124)
    n_mate = min(len(mates), round(TOTAL * MATE_SHARE))
    n_tac = min(len(tactics), TOTAL - n_mate)
    if n_mate + n_tac < TOTAL:
        n_mate = min(len(mates), TOTAL - n_tac)

    def pick(lst, n):
        # an even sample over the whole rating range
        lst.sort(key=lambda r: r[3])
        if n >= len(lst):
            return lst[:]
        step = len(lst) / n
        return [lst[int(i * step)] for i in range(n)]
    chosen = pick(mates, n_mate) + pick(tactics, n_tac)
    # gradually harder: by rating, lightly shuffled inside narrow rating bands
    chosen.sort(key=lambda r: (r[3] // 15, rnd.random()))
    chosen = spread(chosen)
    with open(dst, 'w', encoding='utf-8') as out:
        for r in chosen:
            out.write('\t'.join(map(str, r)) + '\n')
    print(f'wrote {len(chosen)} puzzles ({n_mate} mates, {n_tac} tactics)', file=sys.stderr)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
