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
