#!/bin/bash

# Create project directory
mkdir -p tetris_game
cd tetris_game

# 1. DIContainer.js - The Service Locator
cat > DIContainer.js << 'EOF'
class DIContainer {
    constructor() { this.services = new Map(); }
    register(name, instance) { this.services.set(name, instance); }
    get(name) { return this.services.get(name); }
}
EOF

# 2. Piece.js - The Tetrimino Entity
cat > Piece.js << 'EOF'
class Piece {
    constructor() {
        this.type = Math.floor(Math.random() * 7);
        this.shapes = [[['xxxx']], [[' x ', 'xxx']], [[' xx', 'xx ']], [['xx', 'xx']], [['  x','xxx']], [['x  ','xxx']], [['xx ', ' xx']]];
        this.shape = this.shapes[this.type];
        this.x = 3; this.y = 0; this.rotation = 0; this.target = null;
    }
    shapeState(x, y, r) {
        let lx = this.shape[0].length-1, ly = this.shape.length-1;
        if (r === 0) return this.shape[y] && this.shape[y][x] === 'x';
        if (r === 1) return this.shape[ly-x] && this.shape[ly-x][y] === 'x';
        if (r === 2) return this.shape[ly-y] && this.shape[ly-y][lx-x] === 'x';
        if (r === 3) return this.shape[x] && this.shape[x][lx-y] === 'x';
    }
    dim(r) { return (r%2===0) ? {w:this.shape[0].length, h:this.shape.length} : {w:this.shape.length, h:this.shape[0].length}; }
    canMove(b, dx, dy, dr=this.rotation) {
        let {w, h} = this.dim(dr);
        for(let y=0; y<h; y++) {
            for(let x=0; x<w; x++) {
                if(this.shapeState(x,y,dr)) {
                    let nx = this.x+dx+x, ny = this.y+dy+y;
                    if(nx<0 || nx>=10 || ny>=20 || (ny>=0 && b[nx][ny] !== false)) return false;
                }
            }
        }
        return true;
    }
    move(b, dx, dy) { if(this.canMove(b,dx,dy)){ this.x+=dx; this.y+=dy; return true; } return false; }
    rotate(b) { let nr = (this.rotation+1)%4; if(this.canMove(b,0,0,nr)) this.rotation = nr; }
}
EOF

# 3. Renderer.js - Visual Output
cat > Renderer.js << 'EOF'
class Renderer {
    constructor() {
        this.table = document.getElementById('world');
        this.preview = document.getElementById('preview');
        this.setup();
    }
    setup() {
        this.table.innerHTML = "";
        for(let y=0; y<20; y++) {
            let r = this.table.insertRow();
            for(let x=0; x<10; x++) r.insertCell();
        }
    }
    render(board, active, score, lvl, autoCount) {
        for(let y=0; y<20; y++) {
            for(let x=0; x<10; x++) {
                this.table.rows[y].cells[x].className = board[x][y] !== false ? `c${board[x][y]}` : "";
            }
        }
        this.drawPiece(active, board);
        document.getElementById('score-val').innerText = score;
        document.getElementById('level-val').innerText = lvl;
        document.getElementById('auto-val').innerText = autoCount;
    }
    drawPiece(p, b) {
        let {w, h} = p.dim(p.rotation);
        for(let y=0; y<h; y++) {
            for(let x=0; x<w; x++) {
                if(p.shapeState(x,y,p.rotation)) this.table.rows[p.y+y].cells[p.x+x].className = `c${p.type}`;
            }
        }
    }
}
EOF

# 4. Autopilot.js - The AI Brain
cat > Autopilot.js << 'EOF'
class Autopilot {
    constructor() { this.active = false; this.timeLeft = 0; }
    update(engine) {
        if (!this.active) return;
        const p = engine.activePiece;
        if (!p.target) p.target = this.solve(engine);
        
        if (p.rotation !== p.target.rot) p.rotate(engine.board);
        else if (p.x < p.target.x) p.move(engine.board, 1, 0);
        else if (p.x > p.target.x) p.move(engine.board, -1, 0);
    }
    solve(engine) {
        let bestX = 0, bestRot = 0, bestY = -1;
        for(let r=0; r<4; r++) {
            for(let x=0; x<10; x++) {
                if (engine.activePiece.canMove(engine.board, x - engine.activePiece.x, 0, r)) {
                    let y = 0; while(engine.activePiece.canMove(engine.board, x - engine.activePiece.x, y+1, r)) y++;
                    if (y > bestY) { bestY = y; bestX = x; bestRot = r; }
                }
            }
        }
        return {x: bestX, rot: bestRot};
    }
}
EOF

# 5. TetrisEngine.js - The Controller
cat > TetrisEngine.js << 'EOF'
class TetrisEngine {
    constructor(container) {
        this.container = container;
        this.renderer = container.get('renderer');
        this.autopilot = container.get('autopilot');
        this.board = Array.from({length: 10}, () => Array(20).fill(false));
        this.score = 0; this.level = 1; this.autoCharges = 3;
        this.activePiece = new Piece();
    }
    start() {
        this.loop();
    }
    loop() {
        this.autopilot.update(this);
        if (!this.activePiece.move(this.board, 0, 1)) {
            this.lockPiece();
        }
        this.renderer.render(this.board, this.activePiece, this.score, this.level, this.autoCharges);
        setTimeout(() => this.loop(), 500 - (this.level * 30));
    }
    lockPiece() {
        // Logic to fix piece and check lines
        this.activePiece = new Piece();
    }
}
EOF

# 6. Main entry point (index.html)
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="../tetris.css">
    <script src="DIContainer.js"></script>
    <script src="Piece.js"></script>
    <script src="Renderer.js"></script>
    <script src="Autopilot.js"></script>
    <script src="TetrisEngine.js"></script>
</head>
<body>
    <div class="stat-box">Score: <span id="score-val">0</span> | Level: <span id="level-val">1</span> | Auto: <span id="auto-val">3</span></div>
    <table id="world"></table>
    <script>
        const container = new DIContainer();
        container.register('renderer', new Renderer());
        container.register('autopilot', new Autopilot());
        
        const game = new TetrisEngine(container);
        game.start();
        
        window.addEventListener('keydown', e => {
            if(e.key === 'a') container.get('autopilot').active = true;
        });
    </script>
</body>
</html>
EOF

echo "Project generated in ./tetris_game"