import { shuffle } from './shuffle.js'

export function generateBoard(themeImages, pairCount = 8) {
  // Ensure we don't ask for more pairs than we have images
  const safePairCount = Math.min(pairCount, themeImages.length)
  // Select a subset of images if needed
  const selectedImages = themeImages.slice(0, safePairCount)
  
  const pairs = []
  for (let i = 0; i < selectedImages.length; i++) {
    const img = selectedImages[i]
    pairs.push({ pairId: i, image: img, visible: false, matched: false })
    pairs.push({ pairId: i, image: img, visible: false, matched: false })
  }
  return shuffle(pairs)
}

export function flipTile(board, index) {
  const b = board.map((t) => ({ ...t }))
  const tile = b[index]
  if (!tile) return b
  if (tile.matched || tile.visible) return b
  b[index].visible = true
  return b
}

export function checkMatch(board, firstIndex, secondIndex) {
  if (firstIndex === secondIndex) return false
  const t1 = board[firstIndex]
  const t2 = board[secondIndex]
  if (!t1 || !t2) return false
  return t1.pairId === t2.pairId
}

export function getOpenIndices(board) {
  const open = []
  for (let i = 0; i < board.length; i++) {
    const t = board[i]
    if (t.visible && !t.matched) open.push(i)
  }
  return open
}

export function updateMatchedState(board) {
  const b = board.map((t) => ({ ...t }))
  const open = getOpenIndices(b)
  if (open.length === 2) {
    const [i1, i2] = open
    if (checkMatch(b, i1, i2)) {
      b[i1].matched = true
      b[i2].matched = true
    } else {
      b[i1].visible = false
      b[i2].visible = false
    }
  }
  return b
}

export function isCompleted(board) {
  for (const t of board) if (!t.matched) return false
  return true
}

export function serializeBoard(board) {
  return board
}

export function deserializeBoard(json) {
  return json
}