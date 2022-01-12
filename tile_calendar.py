#!/usr/bin/env python3

import datetime
import sys
import colored

FREE = '_'
tiles = [                                      # id  block    orientation
    [(0, 0), (0, 1), (0, 2), (0, 3)],          # 0 ▀▀▀▀    ▄  04
    [(0, 0), (0, 1), (0, 2), (1, 2), (2, 2)],  # 1       ▄▄█  0123
    [(0, 0), (1, 0), (1, 1), (2, 1)],          # 2 ▀█▄     ▄  0145
    [(0, 0), (0, 1), (1, 1), (2, 1), (2, 2)],  # 3  ▄    █▀▀  0145
    [(0, 0), (0, 1), (0, 2), (1, 1), (2, 1)],  # 4 ▄█▄        0145
    [(0, 0), (0, 1), (0, 2), (1, 0), (1, 2)],  # 5       █▀█  0145
    [(0, 0), (0, 1), (0, 2), (1, 1), (1, 2)],  # 6 ▀██        *
    [(0, 0), (0, 1), (0, 2), (1, 2)],          # 7       ▀▀█  *
    [(0, 0), (0, 1), (0, 2), (0, 3), (1, 3)],  # 8 ▀▀▀█       *
    [(0, 0), (0, 1), (0, 2), (1, 2), (1, 3)]]  # 9       ▀▀█▄ *
orientation_all = list(range(8))
orientation_half = [0, 1, 4, 5]
orientations = [
    [0, 4], [0, 1, 2, 3], orientation_half, orientation_half, orientation_half, orientation_half,
    orientation_half, orientation_all, orientation_all, orientation_all, orientation_all]

def init_board(date):
    bord = [ [ FREE for _ in range(7)] for j in range(8) ]
    bord[7][0:4] = [' ', ' ', ' ', ' ']
    bord[0][6], bord[1][6] = [' ', ' ']
    bord[int((date.month - 1) / 6)][(date.month - 1) % 6] = 'M'
    bord[int((date.day - 1) / 7) + 2][(date.day - 1) % 7] = 'D'
    weekday = date.weekday()
    bord[int(weekday / 3) % 2 + 6][weekday % 3 + 4 - int(weekday / 6)] = 'W'
    return bord

def orient_tile(tile, orientation):
    flipAxis = bool(orientation >> 2)
    flipY = bool((orientation >> 1) % 2)
    flipX = bool(orientation % 2)
    if flipX:
        maxX = max([x for x, y in tile])
        tile = [(maxX - x, y) for x, y in tile]
    if flipY:
        maxY = max([y for x, y in tile])
        tile = [(x, maxY - y) for x, y in tile]
    if flipAxis:
        tile = [(y, x) for x, y in tile]
    return tile

def position_tile(position, tile, piece):
    return [(x - tile[piece][0] + position[0],
        y - tile[piece][1] + position[1]) for x, y in tile]

def check_tile(bord, tile):
    return all([0 <= x < 8 and 0 <= y < 7 and bord[x][y] == FREE for x, y in tile])

def lay_tile(bord, tile, tile_id):
    bord = [list(row) for row in bord]
    for x, y in tile:
        bord[x][y] = str(tile_id)
    return bord

def free_position(bord):
    for i, row in enumerate(bord):
        for j, cell in enumerate(row):
            if cell == FREE:
                return i, j
    return -1, -1

def solve(bord, remaining_tiles):
    next_free = free_position(bord)
    if next_free == (-1, -1):
        return bord
    for id, orientation, piece in iter_tiles(remaining_tiles):
        ptile = position_tile(next_free, orient_tile(tiles[id], orientation), piece)
        if not check_tile(bord, ptile):
            continue
        nboard = solve(
            lay_tile(bord, ptile, id),
            list(filter(lambda i: i != id, remaining_tiles)))
        if nboard is None:
            continue
        return nboard
    return None

def iter_tiles(remaining_tiles):
    for id in remaining_tiles:
        for orientation in orientations[id]:
            for piece, _ in enumerate(tiles[id]):
                yield(id, orientation, piece)

def manual(bord, tile_list, id, orientation, piece):
    next_free = free_position(bord)
    return lay_tile(bord, position_tile(next_free, orient_tile(tiles[id], orientation), piece), id), \
        list(filter(lambda x: x != id, tile_list))

def get_orientation(bord, tile_id):
    next_free = free_position(bord)
    print(next_free)
    for id, orientation, piece in iter_tiles([tile_id]):
        ptile = position_tile(next_free, orient_tile(tiles[id], orientation), piece)
        if check_tile(bord, ptile):
            print([orientation, piece])
            print_bord(lay_tile(bord, ptile, id))

def print_bord(bord):
    printed = []
    print(colored.fg(0))
    for row in bord:
        print('  ', end='')
        for cell in row:
            if cell in '0123456789':
                if cell in printed:
                    content = '  '
                else:
                    content = cell + ' '
                    printed += content
                print(colored.bg(int(cell) + 1) + content + colored.bg(16), end='')
            else:
                print(colored.fg(15) + cell + ' ' + colored.fg(0), end='')
        print()
    print(colored.attr(0))


if __name__ == '__main__':
    if len(sys.argv) > 1:
        date = datetime.datetime.strptime(sys.argv[1], '%d.%m.%Y')
    else:
        date = datetime.datetime.today()
    tile_list = list(range(len(tiles)))
    bord = init_board(date)

    time = datetime.datetime.now()
    sbord = solve(bord, tile_list)

    if sbord is None:
        print("Keine Lösung gefunden")
        sys.exit(1)

    runtime = (datetime.datetime.now() - time).total_seconds()
    print_bord(sbord)
    print(f'Lösung {"sofort" if runtime < 1 else f"in {runtime:.0f} Sekunden"} gefunden')
