// Saf çekirdek — grid/çarpışma modeli, oyun kuralı bilmez (docs/05-architecture.md).
export const LEVEL = { rows: 4, cols: 10, w: 40, h: 16, gapX: 4, gapY: 4, offX: 22, offY: 64 };

export function createGrid(level = LEVEL) {
  const bricks = [];
  for (let row = 0; row < level.rows; row += 1) {
    const line = [];
    for (let col = 0; col < level.cols; col += 1) {
      line.push({ alive: true });
    }
    bricks.push(line);
  }
  return bricks;
}

export function brickRect(level, row, col) {
  return {
    x: level.offX + col * (level.w + level.gapX),
    y: level.offY + row * (level.h + level.gapY),
    w: level.w,
    h: level.h,
  };
}

export function candidateCells(level, ball) {
  const minCol = Math.floor((ball.x - ball.r - level.offX) / (level.w + level.gapX));
  const maxCol = Math.floor((ball.x + ball.r - level.offX) / (level.w + level.gapX));
  const minRow = Math.floor((ball.y - ball.r - level.offY) / (level.h + level.gapY));
  const maxRow = Math.floor((ball.y + ball.r - level.offY) / (level.h + level.gapY));
  const cells = [];
  for (let row = Math.max(0, minRow); row <= Math.min(level.rows - 1, maxRow); row += 1) {
    for (let col = Math.max(0, minCol); col <= Math.min(level.cols - 1, maxCol); col += 1) {
      cells.push({ row, col });
    }
  }
  return cells;
}

function overlaps(ball, rect) {
  return (
    ball.x + ball.r > rect.x &&
    ball.x - ball.r < rect.x + rect.w &&
    ball.y + ball.r > rect.y &&
    ball.y - ball.r < rect.y + rect.h
  );
}

export function hitBrick(bricks, level, ball) {
  const cells = candidateCells(level, ball);
  for (const { row, col } of cells) {
    const brick = bricks[row][col];
    if (!brick.alive) continue;
    const rect = brickRect(level, row, col);
    if (!overlaps(ball, rect)) continue;
    const overlapX = Math.min(ball.x + ball.r - rect.x, rect.x + rect.w - (ball.x - ball.r));
    const overlapY = Math.min(ball.y + ball.r - rect.y, rect.y + rect.h - (ball.y - ball.r));
    brick.alive = false;
    return { row, col, axis: overlapX < overlapY ? 'x' : 'y' };
  }
  return null;
}
