const pieces = [
    { shape: ['xxxx'], color: 0 },
    { shape: [' x ', 'xxx'], color: 1 },
    { shape: [' xx', 'xx '], color: 2 },
    { shape: ['xx', 'xx'], color: 3 },
    { shape: ['  x', 'xxx'], color: 4 },
    { shape: ['x  ', 'xxx'], color: 5 },
    { shape: ['xx ', ' xx'], color: 6 }
];

const field = {
    content: [],
    width: 10,
    height: 20,
    piece: null,
    nextPieceData: null,
    table: null,
    previewTable: null,
    speed: 500,
    level: 1,
    isRunning: false,
    score: 0,
    timer: null,
    autoCharges: 3,
    isAutoActive: false,
    autoTimeLeft: 0,
    autoInterval: null,
    isDemoMode: false,

    init() {
        this.table = document.getElementById('world');
        this.previewTable = document.getElementById('preview-table');
        this.resetInternalState();
        this.renderGrids();
        this.startDemo();
    },

    resetInternalState() {
        this.score = 0;
        this.level = 1;
        this.speed = 500;
        this.autoCharges = 3;
        this.content = Array.from({ length: this.width }, () => Array(this.height).fill(false));
        this.nextPieceData = pieces[Math.floor(Math.random() * pieces.length)];
        this.isDemoMode = false;
        document.getElementById('demo-msg').style.visibility = 'hidden';
        this.updateUI();
    },

    renderGrids() {
        this.table.innerHTML = '';
        for (let y = 0; y < this.height; y++) {
            const row = this.table.insertRow();
            for (let x = 0; x < this.width; x++) {
                row.insertCell();
            }
        }

        this.previewTable.innerHTML = '';
        for (let y = 0; y < 4; y++) {
            const row = this.previewTable.insertRow();
            for (let x = 0; x < 4; x++) {
                row.insertCell();
            }
        }
    },

    startDemo() {
        this.isDemoMode = true;
        this.isAutoActive = true;
        this.isRunning = true;
        document.getElementById('demo-msg').style.visibility = 'visible';
        document.getElementById('auto-box').classList.add('auto-active');
        document.getElementById('world').classList.add('autopilot-bg');
        this.addPiece();
        this.step();
    },

    addPiece() {
        const pData = this.nextPieceData;
        this.nextPieceData = pieces[Math.floor(Math.random() * pieces.length)];
        this.drawPreview();
        this.piece = new Piece(pData.shape, pData.color, this);

        if (!this.piece.canMove(0, 0)) {
            if (this.isDemoMode) {
                this.resetInternalState();
                this.startDemo();
                return;
            }
            this.gameOver();
            return false;
        }

        this.piece.markMe();
        return true;
    },

    drawPreview() {
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                this.previewTable.rows[y].cells[x].className = '';
                if (this.nextPieceData.shape[y] && this.nextPieceData.shape[y][x] === 'x') {
                    this.previewTable.rows[y].cells[x].className = 'color-' + this.nextPieceData.color;
                }
            }
        }
    },

    step() {
        if (!this.isRunning) {
            return;
        }

        if (this.isAutoActive) {
            this.runAutoLogic();
        }

        if (this.piece && !this.piece.move(0, 1)) {
            this.piece.fix();
            this.checkLines();
            this.piece = null;
            if (!this.addPiece()) {
                return;
            }
        }

        this.timer = setTimeout(() => {
            this.step();
        }, this.speed);
    },

    runAutoLogic() {
        if (!this.piece) {
            return;
        }

        if (!this.piece.target) {
            this.piece.target = this.piece.calculateBestMove();
        }

        if (this.piece.rotation !== this.piece.target.rot) {
            this.piece.rotate();
        } else if (this.piece.x < this.piece.target.x) {
            this.piece.move(1, 0);
        } else if (this.piece.x > this.piece.target.x) {
            this.piece.move(-1, 0);
        }
    },

    startAutopilot() {
        if (this.isDemoMode) {
            return;
        }

        if (this.autoCharges > 0 && !this.isAutoActive) {
            this.autoCharges--;
            this.isAutoActive = true;
            this.autoTimeLeft = 5.0;
            document.getElementById('auto-box').classList.add('auto-active');
            document.getElementById('world').classList.add('autopilot-bg');
            document.getElementById('auto-timer').style.display = 'block';
            this.updateUI();

            this.autoInterval = setInterval(() => {
                this.autoTimeLeft -= 0.1;
                document.getElementById('auto-timer').innerText = `ACTIVE: ${this.autoTimeLeft.toFixed(1)}s`;
                if (this.autoTimeLeft <= 0) {
                    this.stopAutopilot();
                }
            }, 100);
        }
    },

    stopAutopilot() {
        this.isAutoActive = false;
        this.isDemoMode = false;
        clearInterval(this.autoInterval);
        document.getElementById('auto-box').classList.remove('auto-active');
        document.getElementById('world').classList.remove('autopilot-bg');
        document.getElementById('auto-timer').style.display = 'none';
        document.getElementById('demo-msg').style.visibility = 'hidden';
    },

    checkLines() {
        let cleared = 0;
        for (let y = this.height - 1; y >= 0; y--) {
            if (this.content.every((col) => col[y] !== false)) {
                cleared++;
                this.removeLine(y);
                y++;
            }
        }

        if (cleared > 0) {
            this.updateScore([0, 100, 300, 500, 800][cleared] * this.level);
        }
    },

    removeLine(yLine) {
        for (let y = yLine; y > 0; y--) {
            for (let x = 0; x < this.width; x++) {
                this.content[x][y] = this.content[x][y - 1];
                this.table.rows[y].cells[x].className = this.table.rows[y - 1].cells[x].className;
            }
        }
    },

    updateScore(pts) {
        this.score += pts;
        const oldLvl = this.level;
        this.level = Math.floor(this.score / 1000) + 1;
        if (this.level > oldLvl) {
            this.autoCharges++;
        }
        this.speed = Math.max(100, 500 - this.level * 30);
        this.updateUI();
    },

    updateUI() {
        document.getElementById('score').innerText = this.score;
        document.getElementById('level').innerText = this.level;
        document.getElementById('auto-count').innerText = this.isDemoMode ? '∞' : this.autoCharges;
    },

    gameOver() {
        this.isRunning = false;
        this.stopAutopilot();
        alert('Game Over! Score: ' + this.score);
    }
};

function Piece(shape, colorIndex, fieldRef) {
    this.shape = shape;
    this.colorIndex = colorIndex;
    this.field = fieldRef;
    this.x = 3;
    this.y = 0;
    this.rotation = 0;
    this.target = null;

    this.rotate = function () {
        this.unmarkMe();
        const old = this.rotation;
        this.rotation = (this.rotation + 1) % 4;
        if (!this.canMove(0, 0)) {
            this.rotation = old;
        }
        this.markMe();
    };

    this.canMove = function (ax, ay, rot = this.rotation) {
        const dim = this.dim(rot);
        for (let y = 0; y < dim.h; y++) {
            for (let x = 0; x < dim.w; x++) {
                if (this.shapeState(x, y, rot)) {
                    const nx = this.x + ax + x;
                    const ny = this.y + ay + y;
                    if (nx < 0 || nx >= this.field.width || ny >= this.field.height) {
                        return false;
                    }
                    if (ny >= 0 && this.field.content[nx][ny] !== false) {
                        return false;
                    }
                }
            }
        }
        return true;
    };

    this.shapeState = function (x, y, rot) {
        const ly = this.shape.length - 1;
        const lx = this.shape[0].length - 1;
        if (rot === 0) {
            return this.shape[y] && this.shape[y][x] === 'x';
        }
        if (rot === 1) {
            return this.shape[ly - x] && this.shape[ly - x][y] === 'x';
        }
        if (rot === 2) {
            return this.shape[ly - y] && this.shape[ly - y][lx - x] === 'x';
        }
        return this.shape[x] && this.shape[x][lx - y] === 'x';
    };

    this.dim = function (rot) {
        if (rot % 2 === 0) {
            return { w: this.shape[0].length, h: this.shape.length };
        }
        return { w: this.shape.length, h: this.shape[0].length };
    };

    this.move = function (dx, dy) {
        if (this.canMove(dx, dy)) {
            this.unmarkMe();
            this.x += dx;
            this.y += dy;
            this.markMe();
            return true;
        }
        return false;
    };

    this.markMe = function () {
        const dim = this.dim(this.rotation);
        for (let y = 0; y < dim.h; y++) {
            for (let x = 0; x < dim.w; x++) {
                if (this.shapeState(x, y, this.rotation)) {
                    this.field.table.rows[this.y + y].cells[this.x + x].className = 'color-' + this.colorIndex;
                }
            }
        }
    };

    this.unmarkMe = function () {
        const dim = this.dim(this.rotation);
        for (let y = 0; y < dim.h; y++) {
            for (let x = 0; x < dim.w; x++) {
                if (this.shapeState(x, y, this.rotation)) {
                    this.field.table.rows[this.y + y].cells[this.x + x].className = '';
                }
            }
        }
    };

    this.fix = function () {
        const dim = this.dim(this.rotation);
        for (let y = 0; y < dim.h; y++) {
            for (let x = 0; x < dim.w; x++) {
                if (this.shapeState(x, y, this.rotation) && this.y + y >= 0) {
                    this.field.content[this.x + x][this.y + y] = this.colorIndex;
                }
            }
        }
    };

    this.calculateBestMove = function () {
        let bestX = 0;
        let bestRot = 0;
        let bestScore = -1000000;

        for (let r = 0; r < 4; r++) {
            for (let tx = -2; tx < this.field.width; tx++) {
                const tempX = this.x;
                this.x = tx;
                if (this.canMove(0, 0, r)) {
                    let gy = 0;
                    while (this.canMove(0, gy + 1, r)) {
                        gy++;
                    }
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
    };
}

function resetGame() {
    clearTimeout(field.timer);
    field.stopAutopilot();
    field.resetInternalState();
    field.renderGrids();
    field.isDemoMode = false;
    field.isRunning = true;
    field.addPiece();
    field.step();
}

function handleGameAction(action) {
    if (field.isDemoMode) {
        field.stopAutopilot();
        resetGame();
        return;
    }

    if (!field.isRunning || field.isAutoActive || !field.piece) {
        return;
    }

    if (action === 'left') {
        field.piece.move(-1, 0);
    } else if (action === 'right') {
        field.piece.move(1, 0);
    } else if (action === 'down') {
        field.piece.move(0, 1);
    } else if (action === 'rotate') {
        field.piece.rotate();
    } else if (action === 'drop') {
        while (field.piece.move(0, 1)) {
            // Hard drop until piece can no longer move down.
        }
    } else if (action === 'autopilot') {
        field.startAutopilot();
    }
}

function bindUi() {
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', resetGame);
    }

    const mobileButtons = document.querySelectorAll('[data-action]');
    mobileButtons.forEach((button) => {
        const action = button.getAttribute('data-action');
        button.addEventListener('click', () => {
            handleGameAction(action);
        });
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
            e.preventDefault();
        }

        if (e.key === 'ArrowLeft') {
            handleGameAction('left');
        } else if (e.key === 'ArrowRight') {
            handleGameAction('right');
        } else if (e.key === 'ArrowDown') {
            handleGameAction('down');
        } else if (e.key === 'ArrowUp') {
            handleGameAction('rotate');
        } else if (e.key === ' ') {
            handleGameAction('drop');
        } else if (e.key.toLowerCase() === 'a') {
            handleGameAction('autopilot');
        }
    });
}

bindUi();
field.init();
