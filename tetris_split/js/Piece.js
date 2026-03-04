export class Piece {
  /**
   * @param {string[]} shape
   * @param {number} colorIndex
   * @param {import('./Field.js').Field} field
   */
  constructor(shape, colorIndex, field) {
    this.shape = shape;
    this.colorIndex = colorIndex;
    this.field = field;

    this.x = 3;
    this.y = 0;
    this.rotation = 0;
    this.target = null;
  }

  rotate() {
    this.unmarkMe();
    const old = this.rotation;
    this.rotation = (this.rotation + 1) % 4;
    if (!this.canMove(0, 0)) this.rotation = old;
    this.markMe();
  }

  canMove(ax, ay, rot = this.rotation) {
    const { w, h } = this.dim(rot);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (this.shapeState(x, y, rot)) {
          const nx = this.x + ax + x;
          const ny = this.y + ay + y;

          if (nx < 0 || nx >= this.field.width || ny >= this.field.height) return false;
          if (ny >= 0 && this.field.content[nx][ny] !== false) return false;
        }
      }
    }
    return true;
  }

  shapeState(x, y, rot) {
    const ly = this.shape.length - 1;
    const lx = this.shape[0].length - 1;

    if (rot === 0) return this.shape[y] && this.shape[y][x] === 'x';
    if (rot === 1) return this.shape[ly - x] && this.shape[ly - x][y] === 'x';
    if (rot === 2) return this.shape[ly - y] && this.shape[ly - y][lx - x] === 'x';
    if (rot === 3) return this.shape[x] && this.shape[x][lx - y] === 'x';

    return false;
  }

  dim(rot) {
    return (rot % 2 === 0)
      ? { w: this.shape[0].length, h: this.shape.length }
      : { w: this.shape.length, h: this.shape[0].length };
  }

  move(dx, dy) {
    if (this.canMove(dx, dy)) {
      this.unmarkMe();
      this.x += dx;
      this.y += dy;
      this.markMe();
      return true;
    }
    return false;
  }

  markMe() {
    const { w, h } = this.dim(this.rotation);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (this.shapeState(x, y, this.rotation)) {
          this.field.table.rows[this.y + y].cells[this.x + x].className = `color-${this.colorIndex}`;
        }
      }
    }
  }

  unmarkMe() {
    const { w, h } = this.dim(this.rotation);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (this.shapeState(x, y, this.rotation)) {
          this.field.table.rows[this.y + y].cells[this.x + x].className = '';
        }
      }
    }
  }

  fix() {
    const { w, h } = this.dim(this.rotation);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (this.shapeState(x, y, this.rotation) && this.y + y >= 0) {
          this.field.content[this.x + x][this.y + y] = this.colorIndex;
        }
      }
    }
  }

  calculateBestMove() {
    let bestX = 0;
    let bestRot = 0;
    let bestScore = -1_000_000;

    for (let r = 0; r < 4; r++) {
      for (let tx = -2; tx < this.field.width; tx++) {
        const tempX = this.x;
        this.x = tx;

        if (this.canMove(0, 0, r)) {
          let gy = 0;
          while (this.canMove(0, gy + 1, r)) gy++;

          // Prefer deeper placement; if equal depth, prefer center
          const score = gy * 10 - Math.abs(tx - 4);

          if (score > bestScore) {
            bestScore = score;
            bestX = tx;
            bestRot = r;
          }
        }

        this.x = tempX;
      }
    }

    return { x: bestX, rot: bestRot };
  }
}
