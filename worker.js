/* eslint-env worker */

const FREE = 'x'
const NIL = ' '
let tiles = []

function generateTiles (surface) {
  const O_FLIP = [0, 4]
  const O_HLF1 = [0, 1, 2, 3]
  const O_HMAT = [0, 5]
  const O_HGLO = [1, 4]
  const O_HLF2 = surface === 0 ? O_HGLO.concat(O_HMAT) : surface === 1 ? O_HMAT : O_HGLO
  const O_HLF3 = [0, 1, 4, 5]
  const O_FMAT = [0, 3, 5, 6]
  const O_FGLO = [1, 2, 4, 7]
  const O_FULL = surface === 0 ? O_FGLO.concat(O_FMAT) : surface === 1 ? O_FMAT : O_FGLO
  return [
    //                                     id block
    [O_FLIP, [0, 0], [0, 1], [0, 2], [0, 3]], //         0 ▀▀▀▀
    [O_HLF1, [0, 0], [0, 1], [0, 2], [1, 2], [2, 2]], // 1      ▀▀█
    [O_HLF2, [0, 0], [0, 1], [1, 1], [1, 2]], //         2 ▀█▄  ▄ ▀
    [O_HLF2, [0, 0], [1, 0], [1, 1], [1, 2], [2, 2]], // 3      ▀▀█
    [O_HLF3, [0, 0], [0, 1], [0, 2], [1, 1], [2, 1]], // 4 ▀█▀
    [O_HLF3, [0, 0], [0, 1], [0, 2], [1, 0], [1, 2]], // 5  ▀   █▀█
    [O_FULL, [0, 0], [0, 1], [0, 2], [0, 3], [1, 0]], // 6 █▀▀▀
    [O_FULL, [0, 0], [0, 1], [0, 2], [1, 0]], //         7      █▀▀
    [O_FULL, [0, 0], [0, 1], [0, 2], [1, 1], [1, 2]], // 8 ▀██
    [O_FULL, [0, 2], [0, 3], [1, 0], [1, 1], [1, 2]] //  9     ▄▄█▀
  ].map((t) => ({
    orientation: t[0],
    pieces: t.slice(1).map((p) => ({ x: p[0], y: p[1] }))
  }))
}

self.addEventListener('message', message => calculateTiles(message.data))

function calculateTiles ({ date, surface }) {
  tiles = generateTiles(+surface)
  const tileList = Object.keys(tiles)
  const bord = initBoard(date)

  const solutions = []
  const startTime = self.performance.now()
  console.log('Start')
  for (const solution of solve(bord, tileList)) {
    const solutionText = bordToString(solution)
    if (solutions.includes(solutionText)) {
      continue
    }
    solutions.push(solutionText)
    console.log('Solution')
    self.postMessage({ type: 'solution', bord: solution })
  }
  console.log('End')
  self.postMessage({
    type: 'end',
    runtime: Math.round(self.performance.now() - startTime),
    count: solutions.length
  })
}

function bordToString (bord) {
  return bord.map((row) => row.join('')).join('')
}

function initBoard (date) {
  const datePart = date.toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  }).split(/[., ]+/)
  const bord = Array(8).fill().map(i => Array(7).fill(FREE))
  ;[0, 1].forEach(j => (bord[j][6] = NIL))
  ;[0, 1, 2, 3].forEach(i => (bord[7][i] = NIL))
  bord[Math.floor(date.getMonth() / 6)][
    date.getMonth() % 6] = datePart[1]
  bord[Math.floor((date.getDate() - 1) / 7) + 2][
    (date.getDate() - 1) % 7] = `Day ${datePart[2]}`
  bord[Math.floor(date.getDay() / 4) + 6][
    date.getDay() + (date.getDay() > 3 ? 0 : 3)] = datePart[0]
  return bord
}

function * solve (bord, remainingTiles) {
  const nextFree = freePosition(bord)
  if (nextFree === false) {
    yield bord
    return
  }
  for (const { id, orientation, piece } of iterTiles(remainingTiles)) {
    const ptile = positionTile(nextFree, orientTile(tiles[id].pieces, orientation), piece)
    if (!checkTile(bord, ptile)) {
      continue
    }
    for (const solution of solve(
      layTile(bord, ptile, id),
      remainingTiles.filter(i => i !== id)
    )) {
      yield solution
    }
  }
}

function freePosition (bord) {
  for (let y = 0; y < bord.length; y++) {
    for (let x = 0; x < bord[y].length; x++) {
      if (bord[y][x] === FREE) {
        return { x, y }
      }
    }
  }
  return false
}

function * iterTiles (remainingTiles) {
  for (const id of remainingTiles) {
    for (const orientation of tiles[id].orientation) {
      for (const piece in tiles[id].pieces) {
        yield { id, orientation, piece }
      }
    }
  }
}

function positionTile (position, tile, piece) {
  return tile.map(t => ({
    x: t.x - tile[piece].x + position.x,
    y: t.y - tile[piece].y + position.y
  }))
}

function orientTile (tile, orientation) {
  const flipAxis = !!(+orientation >> 2)
  const flipY = !!((+orientation >> 1) % 2)
  const flipX = !!(+orientation % 2)
  if (flipX) {
    const maxX = Math.max(...tile.map(t => t.x))
    tile = tile.map(t => ({ x: maxX - t.x, y: t.y }))
  }
  if (flipY) {
    const maxY = Math.max(...tile.map(t => t.y))
    tile = tile.map(t => ({ x: t.x, y: maxY - t.y }))
  }
  if (flipAxis) {
    tile = tile.map(t => ({ x: t.y, y: t.x }))
  }
  return tile
}

function checkTile (bord, tile) {
  return tile.reduce((p, t) => p && t.y >= 0 && t.y < 8 && t.x >= 0 && t.x < 7 && bord[t.y][t.x] === FREE, true)
}

function layTile (bord, tile, id) {
  bord = JSON.parse(JSON.stringify(bord))
  tile.forEach(t => (bord[t.y][t.x] = id))
  return bord
}
