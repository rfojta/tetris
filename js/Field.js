import { pieces } from './pieces.js';
import { Piece } from './Piece.js';

export class Field {
  /**
   * @param {{
   *  width?: number,
   *  height?: number,
   *  worldTableId?: string,
   *  previewTableId?: string,
   *  demoMsgId?: string,
   *  levelId?: string,
   *  scoreId?: string,
   *  autoBoxId?: string,
   *  autoCountId?: string,
   *  autoTimerId?: string,
   * }} [opts]
   */
  constructor(opts = {}) {
    this.width = opts.width ?? 10;
    this.height = opts.height ?? 20;

    // DOM ids
    this.worldTableId = opts.worldTableId ?? 'world';
    this.previewTableId = opts.previewTableId ?? 'preview-table';
    this.demoMsgId = opts.demoMsgId ?? 'demo-msg';
    this.levelId = opts.levelId ?? 'level';
    this.scoreId = opts.scoreId ?? 'score';
    this.autoBoxId = opts.autoBoxId ?? 'auto-box';
    this.autoCountId = opts.autoCountId ?? 'auto-count';
    this.autoTimerId = opts.autoTimerId ?? 'auto-timer';

    // state
    this.content = [];
    this.piece = null;
    this.nextPieceData = null;

    this.table = null;
    this.previewTable = null;

    this.speed = 500;
    this.level = 1;
    this.isRunning = false;
    this.score = 0;

    this.timer = null;
    this.autoCharges = 3;

    this.isAutoActive = false;
    this.autoTimeLeft = 0;
    this.autoInterval = null;

    this.isDemoMode = false;
  }

  init() {
    this.table = document.getElementById(this.worldTableId);
    this.previewTable = document.getElementById(this.previewTableId);

    this.resetInternalState();
    this.renderGrids();
    this.startDemo(); // Start in Demo Mode automatically
  }

  resetInternalState() {
    this.score = 0;
    this.level = 1;
    this.speed = 500;
    this.autoCharges = 3;

    this.content = Array.from({ length: this.width }, () => Array(this.height).fill(false));
    this.nextPieceData = pieces[Math.floor(Math.random() * pieces.length)];

    this.isDemoMode = false;
    this.getDemoMsgEl().style.visibility = 'hidden';
    this.updateUI();
  }

  renderGrids() {
    // world table
    this.table.innerHTML = '';
    for (let y = 0; y < this.height; y++) {
      const row = this.table.insertRow();
      for (let x = 0; x < this.width; x++) row.insertCell();
    }

    // preview table (4x4)
    this.previewTable.innerHTML = '';
    for (let y = 0; y < 4; y++) {
      const row = this.previewTable.insertRow();
      for (let x = 0; x < 4; x++) row.insertCell();
    }
  }

  startDemo() {
    this.isDemoMode = true;
    this.isAutoActive = true;
    this.isRunning = true;

    this.getDemoMsgEl().style.visibility = 'visible';
    this.getAutoBoxEl().classList.add('auto-active');
    this.table.classList.add('autopilot-bg');

    this.addPiece();
    this.step();
  }

  addPiece() {
    const pData = this.nextPieceData;
    this.nextPieceData = pieces[Math.floor(Math.random() * pieces.length)];
    this.drawPreview();

    this.piece = new Piece(pData.shape, pData.color, this);

    if (!this.piece.canMove(0, 0)) {
      if (this.isDemoMode) {
        this.resetInternalState();
        this.startDemo();
        return true;
      }
      this.gameOver();
      return false;
    }

    this.piece.markMe();
    return true;
  }

  drawPreview() {
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        this.previewTable.rows[y].cells[x].className = '';
        if (this.nextPieceData.shape[y] && this.nextPieceData.shape[y][x] === 'x') {
          this.previewTable.rows[y].cells[x].className = `color-${this.nextPieceData.color}`;
        }
      }
    }
  }

  step() {
    if (!this.isRunning) return;

    if (this.isAutoActive) this.runAutoLogic();

    if (this.piece) {
      if (!this.piece.move(0, 1)) {
        this.piece.fix();
        this.checkLines();
        this.piece = null;
        if (!this.addPiece()) return;
      }
    }

    this.timer = setTimeout(() => this.step(), this.speed);
  }

  runAutoLogic() {
    if (!this.piece) return;

    if (!this.piece.target) this.piece.target = this.piece.calculateBestMove();

    if (this.piece.rotation !== this.piece.target.rot) {
      this.piece.rotate();
    } else if (this.piece.x < this.piece.target.x) {
      this.piece.move(1, 0);
    } else if (this.piece.x > this.piece.target.x) {
      this.piece.move(-1, 0);
    }
  }

  startAutopilot() {
    if (this.isDemoMode) return;

    if (this.autoCharges > 0 && !this.isAutoActive) {
      this.autoCharges--;
      this.isAutoActive = true;
      this.autoTimeLeft = 5.0;

      this.getAutoBoxEl().classList.add('auto-active');
      this.table.classList.add('autopilot-bg');

      const timerEl = this.getAutoTimerEl();
      timerEl.style.display = 'block';

      this.updateUI();

      this.autoInterval = setInterval(() => {
        this.autoTimeLeft -= 0.1;
        timerEl.innerText = `ACTIVE: ${this.autoTimeLeft.toFixed(1)}s`;
        if (this.autoTimeLeft <= 0) this.stopAutopilot();
      }, 100);
    }
  }

  stopAutopilot() {
    this.isAutoActive = false;
    this.isDemoMode = false;

    clearInterval(this.autoInterval);

    this.getAutoBoxEl().classList.remove('auto-active');
    this.table.classList.remove('autopilot-bg');

    const timerEl = this.getAutoTimerEl();
    timerEl.style.display = 'none';

    this.getDemoMsgEl().style.visibility = 'hidden';
  }

  checkLines() {
    let cleared = 0;

    for (let y = this.height - 1; y >= 0; y--) {
      if (this.content.every((col) => col[y] !== false)) {
        cleared++;
        this.removeLine(y);
        y++; // re-check the same line after shifting
      }
    }

    if (cleared > 0) {
      const table = [0, 100, 300, 500, 800];
      this.updateScore((table[cleared] ?? 0) * this.level);
    }
  }

  removeLine(yLine) {
    for (let y = yLine; y > 0; y--) {
      for (let x = 0; x < this.width; x++) {
        this.content[x][y] = this.content[x][y - 1];
        this.table.rows[y].cells[x].className = this.table.rows[y - 1].cells[x].className;
      }
    }
  }

  updateScore(pts) {
    this.score += pts;

    const oldLvl = this.level;
    this.level = Math.floor(this.score / 1000) + 1;

    if (this.level > oldLvl) this.autoCharges++;

    this.speed = Math.max(100, 500 - this.level * 30);
    this.updateUI();
  }

  updateUI() {
    document.getElementById(this.scoreId).innerText = String(this.score);
    document.getElementById(this.levelId).innerText = String(this.level);
    document.getElementById(this.autoCountId).innerText = this.isDemoMode ? '∞' : String(this.autoCharges);
  }

  gameOver() {
    this.isRunning = false;
    this.stopAutopilot();
    alert(`Game Over! Score: ${this.score}`);
  }

  resetGame() {
    clearTimeout(this.timer);
    this.stopAutopilot();

    this.init();

    this.isDemoMode = false;
    this.isRunning = true;

    this.addPiece();
    this.step();
  }

  // DOM helpers
  getDemoMsgEl() { return document.getElementById(this.demoMsgId); }
  getAutoBoxEl() { return document.getElementById(this.autoBoxId); }
  getAutoTimerEl() { return document.getElementById(this.autoTimerId); }
}

